export const array = {
    /**
     * @param array
     * @param index
     * @returns {boolean} true iff the given index is a valid reference for the given array, false otherwise
     */
    hasIndex: (array, index) => {
        return !!array && index >= 0 && index < array.length
    }
}
