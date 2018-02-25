export default class Binder {

    constructor() {
        this.getAllMethods = this.getAllMethods.bind(this);
        this.bindAll = this.bindAll.bind(this);
    }
    getAllMethods(instance, cls) {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(name => {
            let method = instance[name];
            return !(!(method instanceof Function) || method === cls);
        });
    }

    bindAll(instance, cls) {
        this.getAllMethods(instance, cls)
            .forEach(mtd => {
                instance[mtd] = instance[mtd].bind(instance);
            })
    }
}