const DEFAULT_ITEMS_LIMIT = 1000;
const DEFAULT_STORAGE_LEVELS = 3;

class Cache {

    /**
     * @param {object} options
     * @param {Number} options.maxLevels Number of storage levels. Defaults to 3
     * @param {Number} options.limit Number of max items the cache can store per level.
     *                               Defaults to 1000
     */
    constructor(options) {
        options = options || {};
        this.limit = parseInt(options.limit, 10) || DEFAULT_ITEMS_LIMIT;
        this.maxLevels = parseInt(options.maxLevels, 10) || DEFAULT_STORAGE_LEVELS;

        if (this.limit < 0) {
            throw new Error('Limit must be a positive number');
        }
        if (this.maxLevels < 1) {
            throw new Error('Cache needs at least one storage level');
        }

        this.storage = this.createStorage(this.maxLevels);
    }

    /**
     * @param {*} key
     * @param {*} value
     */
    set(key, value) {
        if (this.cacheIsFull()) {
            this.makeRoom();
        }

        this.storage[0].set(key, value);
    }

    /**
     * @param {*} key
     * @return {Boolean}
     */
    has(key) {
        for (let i = 0; i < this.storage.length; i++) {
            if (this.storage[i].has(key)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {*} key
     * @return {*}
     */
    get(key) {
        if (this.storage[0].has(key)) {
            return this.storage[0].get(key);
        }

        return this.getFromLowerLevels(key);
    }

    /**
     * Get an item from the lower levels.
     * If one is found added it to the first level as well
     *
     * @param {*} key
     * @return {*}
     */
    getFromLowerLevels(key) {
        for (let i = 1; i < this.storage.length; i++) {
            const storageLevel = this.storage[i];
            if (!storageLevel.has(key)) {
                continue;
            }
            const value = storageLevel.get(key);
            this.set(key, value);
            return value;
        }
    }

    /**
     * @return {Boolean}
     */
    cacheIsFull() {
        return this.storage[0].size >= this.limit;
    }

    /**
     * Move all the items down by one level
     * and clear the first one to make room for new items
     */
    makeRoom() {
        for (let i = this.storage.length - 1; i > 0; i--) {
            this.storage[i] = this.storage[i - 1];
        }
        this.storage[0] = new Map();
    }

    /**
     * Create an array of Map objects for storing items
     *
     * @param {Number} maxLevels
     * @return {Array.<Map>}
     */
    createStorage(maxLevels) {
        const storage = [];
        for (let i = 0; i < maxLevels; i++) {
            storage.push(new Map());
        }

        return storage;
    }
}

module.exports = Cache;
