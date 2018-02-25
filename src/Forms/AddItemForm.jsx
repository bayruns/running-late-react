import React from 'react';
import { Col, Button, Card, Form, FormGroup, FormFeedback, Label, Input, FormText, CardHeader, CardBody } from 'reactstrap';
import Binder from '../binder.js';

const INVALID_BASE = 'Enter a valid ';
const MODEL_INVALID = INVALID_BASE + 'model.';
const BRAND_INVALID = INVALID_BASE + 'brand.';
const ITEM_NUM_INVALID = INVALID_BASE + 'item number.';

const VALID_BASE = 'Valid ';
const MODEL_VALID = VALID_BASE + ' model.';
const BRAND_VALID = VALID_BASE + ' brand.';
const ITEM_NUM_VALID = VALID_BASE + ' item number.';

export default class AddItemForm extends React.Component {

  constructor(props) {
    super(props);

    const binder = new Binder();
    binder.bindAll(this, AddItemForm);

    this.response = [
      {
        type_id: 1,
        name: "Camera",
        subtypes: [
          { name: "Film", subtype_id: 1 },
          { name: "DSLR", subtype_id: 2 }
        ]
      },
      {
        type_id: 2,
        name: "Tripod",
        subtypes: [
          { name: "Aluminum", subtype_id: 1 },
          { name: "Small", subtype_id: 2 }
        ]
      }
    ];

    this.state = {
      item_num: '',
      type_id: undefined,
      subtype_id: undefined,
      typeOptions: [],
      subtypeOptions: [],
      brand: '',
      model: '',
      description: '',
      itemNumIsValid: false,
      itemNumFeedback: ITEM_NUM_INVALID,
      brandIsValid: false,
      brandFeedback: BRAND_INVALID,
      modelIsValid: false,
      modelFeedback: MODEL_INVALID
    }
  }

  /**
   * Adds an item to the database using the method that was passed in
   * via the addItem prop.
   */
  addItem() {
    if (this.isFormValid()) {
      this.props.addItem(this.state);
    }
  }

  componentDidMount() {
    this.getDropDownMaps(this.response);
  }

  /**
   * Takes a JSON response of typeData and turns it into nested maps that are
   * usable for creating/changing the subtypes based on what type is selected.
   * @param {Object} typeData - A JSON response containing an array of types,
   * where the subtype field is an array of subtype objects. 
   */
  getDropDownMaps(typeData) {

    //the variable to store the final nested map
    var typeMap = new Map();
    //loop through the JSON response
    typeData.forEach(function (type) {
      //declare a new map for this type's subtypes
      var subtypesMap = new Map();
      //loop through the subtypes of this type
      type.subtypes.forEach(function (subtype) {
        //and add them to the subtype map with their id as the key
        subtypesMap.set(subtype.subtype_id, subtype);
      });
      //then replace the subtypes array in the JSON with this subtype map
      type.subtypes = subtypesMap;
      //then put the whole type object into the type map with its id as the key
      typeMap.set(type.type_id, type);
    });

    //then save this map of types to state
    this.setState({
      typeMap: typeMap
    }, //once that map is saved to state, use it to get the type dropdown options
      this.getTypeOptions)
  }

  /**
   * Get and display an array of options that contain all item types.
   */
  getTypeOptions() {
    //grab the types from state
    var types = this.state.typeMap;
    //prepare our array of options
    var options = [];
    //loop through the types
    types.forEach(function (value, key, map) {
      const type_id = value.type_id;
      const name = value.name;
      //add a new option to the array
      options.push(<option key={type_id} value={type_id}>{name}</option>);
    });
    //save these options to state
    this.setState({
      typeOptions: options
    },//once they're saved, get the subtype options for the first item (which will be displayed by default)
      () => this.getSubtypeOptions(this.state.typeOptions[0].props.value));
    return options;
  }

  /**
   * Get and display an array of options that contain the subtypes
   * for the item type that is currently selected.
   * @param {Number|String} type_id - the type_id of the selected item type
   */
  getSubtypeOptions(type_id) {

    //grab the type from state by type id
    //(but subtract 0 so "2" becomes 2 -- option.value returns a string!)
    var type = this.state.typeMap.get(type_id - 0);
    var subtypes = type.subtypes;
    var options = [];
    //loop through the subtypes
    subtypes.forEach(function (value, key, map) {
      const subtype_id = value.subtype_id;
      const name = value.name;
      //add an option with the name on display and a value of the subtype id
      options.push(<option key={subtype_id} value={subtype_id}>{name}</option>);
    });
    //and save these options to state
    this.setState({
      subtypeOptions: options
    });
    return options;
  }

  /**
   * Checks if this form is valid for adding an item.
   * Item number, brand, and model must have correct entries.
   */
  isFormValid() {
    return (this.state.itemNumIsValid
      && this.state.brandIsValid
      && this.state.modelIsValid);
  }

  /**
   * Updates state with the item number, whether it's valid, and the
   * feedback text based on its validity
   * @param {Object} event - the onChange event when the item num text is changed 
   */
  itemNumChanged(event) {
    const item_num = event.target.value;
    const isValid = /^[A-Z]+[0-9]+$/.test(item_num);
    const feedback = (isValid ? ITEM_NUM_VALID : ITEM_NUM_INVALID);
    this.setState({
      item_num: item_num,
      itemNumIsValid: isValid,
      itemNumFeedback: feedback
    });
  }

  /**
   * Updates state with the selected type's id
   * @param {Object} event - the onChange event when the dropdown is changed 
   */
  typeChanged(event) {
    const type_id = event.target.value;
    this.setState({ type_id: type_id },
      () => this.getSubtypeOptions(this.state.type_id));
  }

  /**
   * Updates state with the selected type's id
   * @param {Object} event - the onChange event when the dropdown is changed 
   */
  subtypeChanged(event) {
    const subtype_id = event.target.value;
    this.setState({ subtype_id: subtype_id });
  }

  /**
   * Updates state with the entered brand, whether it's valid, and the
   * feedback text based on its validity
   * @param {Object} event - the onChange event when the brand text is changed 
   */
  brandChanged(event) {
    const brand = event.target.value;
    const isValid = (brand !== '');
    const feedback = (isValid ? BRAND_VALID : BRAND_INVALID);
    this.setState({
      brand: brand,
      brandIsValid: isValid,
      brandFeedback: feedback
    });
  }

   /**
   * Updates state with the entered model, whether it's valid, and the
   * feedback text based on its validity
   * @param {Object} event - the onChange event when the model text is changed 
   */
  modelChanged(event) {
    const model = event.target.value;
    const isValid = (model !== '');
    const feedback = (isValid ? MODEL_VALID : MODEL_INVALID);

    this.setState({
      model: model,
      modelIsValid: isValid,
      modelFeedback: feedback
    });
  }

  /**
   * Updates state with the entered description. Any description is valid.
   * @param {Object} event - the onChange event when the description text is changed 
   */
  descriptionChanged(event) {
    const description = event.target.value;
    this.setState({ description: description });
  }


  render() {

    const buttonColor = (this.isFormValid() ? "primary" : "secondary");
    return (
      <Card>
        <CardHeader>
          Add Item
        </CardHeader>
        <CardBody>
          <Form>
            <FormGroup row>
              <Label for="itemNum" sm={2}>Item Number</Label>
              <Col sm={10}>
                <Input valid={this.state.itemNumIsValid} onChange={this.itemNumChanged} type="input" name="itemNum" id="itemNum" placeholder="Enter an item number..." />
                <FormFeedback>{this.state.itemNumFeedback}</FormFeedback>
                <FormText>A valid item number is one or more capital letters followed by one or more numbers.</FormText>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="itemType" sm={2}>Item Type</Label>
              <Col sm={10}>
                <Input onChange={this.typeChanged} type="select" name="itemType" id="itemType">
                  {this.state.typeOptions}
                </Input>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="subtype" sm={2}>Item Subtype</Label>
              <Col sm={10}>
                <Input onChange={this.subtypeChanged} type="select" name="subtype" id="subtype">
                  {this.state.subtypeOptions}
                </Input>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="brand" sm={2}>Brand</Label>
              <Col sm={10}>
                <Input valid={this.state.brandIsValid} onChange={this.brandChanged} type="input" name="brand" id="brand" placeholder="Enter item brand..." />
                <FormFeedback>{this.state.brandFeedback}</FormFeedback>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="model" sm={2}>Model</Label>
              <Col sm={10}>
                <Input valid={this.state.modelIsValid} onChange={this.modelChanged} type="text" name="model" id="model" placeholder="Enter item model..." />
                <FormFeedback>{this.state.modelFeedback}</FormFeedback>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="description" sm={2}>Description</Label>
              <Col sm={10}>
                <Input onChange={this.descriptionChanged} type="textarea" name="description" id="description" placeholder="Enter a description for this item..." />
              </Col>
            </FormGroup>
            <FormGroup check row>
              <Col sm={{ size: 10, offset: 2 }}>
                <Button color={buttonColor} disabled={!this.isFormValid()} onClick={this.addItem}>Submit</Button>
              </Col>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
    );
  }
}