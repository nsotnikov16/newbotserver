const isEmptyElements = (step) => {
    try {
        return !step.data.elements.length;
    } catch (error) {
        return false;
    }
}

module.exports = {
    isEmptyElements
}