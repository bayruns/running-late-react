import json
import os, time
from chalice import Chalice
from chalicelib import keys
from twilio.rest import Client
import sys
import logging
import pymysql
import secrets
from passlib.hash import pbkdf2_sha256
import string
import random
import datetime
from google.transit import gtfs_realtime_pb2
import requests
from protobuf_to_dict import protobuf_to_dict
import googlemaps

app = Chalice(app_name="RunningLateTest")
app.debug = True


def get_date_time(plus_hours=0):
    return (datetime.datetime.now() + datetime.timedelta(hours=plus_hours)).strftime('%Y-%m-%d %H:%M:%S')


def get_date_string(timestamp):
    time_format = '%Y-%m-%d %H:%M:%S'
    return datetime.datetime.strptime(timestamp, time_format)


def get_connection():
    rds_host = keys.rds_host
    name = keys.db_username
    password = keys.db_password
    db_name = keys.db_name

    logging.basicConfig()
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    try:
        conn = pymysql.connect(
            rds_host, user=name, password=password, db=db_name, connect_timeout=50,
            cursorclass=pymysql.cursors.DictCursor)
    except:
        logger.error(
            "ERROR: Unexpected error: Could not connect to MySql instance.")
        sys.exit()
    logger.info("SUCCESS: Connection to RDS mysql instance succeeded")

    return conn


def check_token(token):
    conn = get_connection()
    valid_found = False
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE token LIKE %s", token)
        for row in cur:
            expiration_time = get_date_string(row["expiration"])
            if expiration_time < datetime.datetime.now():
                cur.execute(
                    "UPDATE users SET token = NULL, token_expiration = NULL WHERE user_id = %s", row["user_id"])
            else:
                valid_found = True
    response_data = {"valid": valid_found}
    conn.close()
    return json.dumps(response_data)


@app.route("/signup", methods=['POST'], cors=True)
def signup():
    print("ENTERING SIGNUP")

    data_in = app.current_request.json_body
    phone = data_in['phone']
    password = data_in['password']
    first = data_in['first']
    last = data_in['last']
    role = 0

    print("HI")

    # Create a hash from the password that was entered
    hash = pbkdf2_sha256.encrypt(password, rounds=200000, salt_size=16)
    conn = get_connection()
    with conn.cursor() as cur:
        confirmation_code = get_confirmation_code()
        cur.execute(
            'INSERT INTO pending_users (phone, first, last, role, hash, token, token_expiration, boss_id, confirmation_code) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)',
            (phone, first, last, role, hash, None, None, None, confirmation_code))
        conn.commit()
        link = "https://runninglate.fyi/verify?id=" + str(cur.lastrowid)

        print("HELLO")

        message = "Your Running Late verification code is " + confirmation_code + "\n" + link
        send_text(phone, message)
    response_data = {"success": True}
    conn.close()
    return json.dumps(response_data)


def get_confirmation_code():
    return ''.join(random.choice(string.ascii_uppercase) for x in range(4))


@app.route("/login", methods=['POST'], cors=True)
def login():
    data_in = app.current_request.json_body
    phone = data_in['phone']
    password = data_in['password']
    conn = get_connection()

    with conn.cursor() as cur:
        response_data = {}
        cur.execute("SELECT * FROM users WHERE phone = %s", phone)
        for row in cur:
            if pbkdf2_sha256.verify(password, row.hash):
                user_id = row.user_id
                token = secrets.token_urlsafe()
                expiration = get_date_time(plus_hours=2)
                cur.execute("UPDATE users SET token = %s, token_expiration = %s WHERE user_id = %s",
                            (token, expiration, row.user_id))
                conn.commit()
                response_data["token"] = token
                response_data["success"] = True
            else:
                response_data["token"] = None
                response_data["success"] = False
        conn.close()
        return json.dumps(response_data)


@app.route("/delays/{station_id}", cors=True)
def delays(station_id):
    return is_train_delayed(station_id)


def send_text(phone, message):
    client = Client(keys.twillio_account_sid, keys.twillio_auth_token)
    client.messages.create(
        to=phone,
        from_=keys.sending_phone_number,
        body=message)


# Because the data feed includes multiple arrival times for a given station
# a global list needs to be created to collect the various times
collected_times = []


# This function takes a converted MTA data feed and a specific station ID and
# loops through various nested dictionaries and lists to (1) filter out active
# trains, (2) search for the given station ID, and (3) append the arrival time
# of any instance of the station ID to the collected_times list
def station_time_lookup(train_data, station):
    for trains in train_data:  # trains are dictionaries
        if trains.get('trip_update', False):
            unique_train_schedule = trains[
                'trip_update']  # train_schedule is a dictionary with trip and stop_time_update
            # arrival_times is a list of arrivals
            unique_arrival_times = unique_train_schedule['stop_time_update']
            for scheduled_arrivals in unique_arrival_times:  # arrivals are dictionaries with time data and stop_ids
                if scheduled_arrivals.get('stop_id', False) == station:
                    time_data = scheduled_arrivals['arrival']
                    unique_time = time_data['time']
                    if unique_time is not None:
                        collected_times.append(unique_time)


def is_train_delayed(stationID, expectedTimestamp=time.time()):
    if stationID == "debugfalse":
        return False
    if stationID == "debugtrue":
        return True

    # return True

    # Requests subway status data feed from City of New York MTA API
    feed = gtfs_realtime_pb2.FeedMessage()
    response = requests.get(
        'http://datamine.mta.info/mta_esi.php?key={}&feed_id=1'.format(keys.mta_api_key))
    feed.ParseFromString(response.content)

    # The MTA data feed uses the General Transit Feed Specification (GTFS) which
    # is based upon Google's "protocol buffer" data format. While possible to
    # manipulate this data natively in python, it is far easier to use the
    # "pip install --upgrade gtfs-realtime-bindings" library which can be found on pypi
    subway_feed = protobuf_to_dict(feed)  # subway_feed is a dictionary
    realtime_data = subway_feed['entity']  # train_data is a list

    # Run the above function for the station ID for Broadway-Lafayette
    station_time_lookup(realtime_data, stationID)

    if collected_times is None:
        return False

    # Sort the collected times list in chronological order (the times from the data
    # feed are in Epoch time format)
    collected_times.sort()

    for timestamp in collected_times:
        if expectedTimestamp - 60 < timestamp < expectedTimestamp + 5 * 60:
            return True

    # Pop off the earliest and second earliest arrival times from the list
    nearest_arrival_time = collected_times[0]
    second_arrival_time = collected_times[1]

    # Grab the current time so that you can find out the minutes to arrival
    current_time = int(time.time())
    time_until_train = int(((nearest_arrival_time - current_time) / 60))

    # This final part of the code checks the time to arrival and prints a few
    # different messages depending on the circumstance
    if time_until_train > 3:
        print(f"""
    It's currently {time.strftime("%I:%M %p")}
    The next Brooklyn-bound B/D train from
    Broadway-Lafayette Station arrives in
    {time_until_train} minutes at {time.strftime("%I:%M %p", time.localtime(nearest_arrival_time))}""")
    elif time_until_train <= 0:
        print("MISSED TRAIN")
        # print("Welp... You *just* missed the train. (╯°□°）╯︵ ┻━┻ Ah well, the next train will arrive at {time.strftime("%I:%M %p", time.localtime(second_arrival_time))}""")
    else:
        print("Train is coming soon")
        # print(f"\n"
        #      f"HURRY UP YOU HAVE {time_until_train} MINUTES TO GET TO\n"
        #      f"BROADWAY-LAFAYETTE IF YOU WANT TO GET HOME!\n"
        #      f"THE TRAIN GETS IN AT {time.strftime(\"%I:%M %p\", time.localtime(nearest_arrival_time))}")

    # These are useful print statments used for script debugging, commented out
    #
    # for times in collected_times:
    #     print(times, "=", time.strftime("%I:%M %p", time.localtime(times)))
    # print(collected_times)
    # print(nearest_arrival_time)
    # print(second_arrival_time)
    # print(time_until_train)


"""
# rds settings
    rds_host = ""
    name = ""
    password = ""
    db_name = ""

    logging.basicConfig()
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    try:
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=50)
    except:
        logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
        sys.exit()

    logger.info("SUCCESS: Connection to RDS mysql instance succeeded")

    item_count = 0

    with conn.cursor() as cur:
        cur.execute("create table Employee3 ( EmpID  int NOT NULL, Name varchar(255) NOT NULL, PRIMARY KEY (EmpID))")
        cur.execute('insert into Employee3 (EmpID, Name) values(1, "Joe")')
        cur.execute('insert into Employee3 (EmpID, Name) values(2, "Bob")')
        cur.execute('insert into Employee3 (EmpID, Name) values(3, "Mary")')
        conn.commit()
        cur.execute("select * from Employee3")
        for row in cur:
            item_count += 1
            logger.info(row)
            print(row)

    conn.close()
    return "Added %d items from RDS MySQL table" % (item_count)
"""


# print(delays("135S"))


def is_likely_to_be_late_by_driving(start_address, end_address):
    gmaps = googlemaps.Client(key=keys.google_maps_api_key)
    return True

    now = datetime.datetime.now()
    directions_result = gmaps.directions(start_address,
                                         end_address,
                                         mode="driving",
                                         departure_time=now
                                         )

    length_current = directions_result[0]['legs'][0]['duration_in_traffic']['value']

    directions_result = gmaps.directions(start_address,
                                         end_address,
                                         mode="driving",
                                         departure_time=now,
                                         traffic_model="optimistic"
                                         )

    optimistic_length = directions_result[0]['legs'][0]['duration_in_traffic']['value']

    directions_result = gmaps.directions(start_address,
                                         end_address,
                                         mode="driving",
                                         departure_time=now,
                                         traffic_model="pessimistic"
                                         )

    pessimistic_length = directions_result[0]['legs'][0]['duration_in_traffic']['value']

    if pessimistic_length * .9 < optimistic_length:
        return False

    if length_current > pessimistic_length - 5:
        return True

    percentile = 0.6
    if length_current > optimistic_length * (1 - percentile) + pessimistic_length * percentile:
        return True

    return False


# is_likely_to_be_late_by_driving()

# print("DONE")


# Main method that gets run by cron job
def main(event=None, context=None):
    print("ENTERING MAIN")

    # data_in = app.current_request.json_body
    # phone = data_in['phone']
    # password = data_in['password']
    conn = get_connection()

    day_of_week = datetime.datetime.now().weekday()
    if day_of_week == 6:
        day_of_week = 0
    else:
        day_of_week += 1

    # departuretime = minutes from midnight

    now = datetime.datetime.now()
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    minutes_since_midnight = int((now - midnight).seconds / 60) - 300  # TODO This is really bad, fix soon

    print("MINUTES SINCE MIDNIGHT", minutes_since_midnight)

    with conn.cursor() as cur:
        users_running_late = []
        cur.execute(
            "SELECT * FROM routes r JOIN users U "
            "USING(route_id) WHERE r.day_of_week = %s "
            "AND r.departure_time <= %s "
            "AND r.departure_time > %s - 5", (day_of_week, minutes_since_midnight, minutes_since_midnight)
        )
        for row in cur:
            name = row['first']
            starting_address = row['starting_address']
            ending_address = row['ending_address']

            if is_likely_to_be_late_by_driving(starting_address, ending_address):
                users_running_late.append(name)

        conn.close()

    if len(users_running_late) > 0:
        send_text("5555555555",
                  "RunningLate.fyi Alert 🚗: There is traffic on the NJ Turnpike. " + str(
                      users_running_late) + " may be late for work")

    return "DONE"


# app()

# check_token("abc")

# main()