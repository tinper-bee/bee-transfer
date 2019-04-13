/**
 * a little function to help us with reordering the result
 * @param {*} list 
 * @param {*} targetKeys
 * @param {*} startIndex 
 * @param {*} endIndex 
 */
const reorder = (list,targetKeys, startIndex, endIndex) => {
    const result1 = Array.from(list);
    const [removed1] = result1.splice(startIndex, 1);
    result1.splice(endIndex, 0, removed1);
    
    const result2 = Array.from(targetKeys);
    const [removed2] = result2.splice(startIndex, 1);
    result2.splice(endIndex, 0, removed2);
    
    let result = {};
    result.dataArr = result1;
    result.targetKeyArr = result2;

    return result;
};

/**
 * Moves an item from one list to another list.
 * @param {*} source 
 * @param {*} destination 
 * @param {*} droppableSource 
 * @param {*} droppableDestination 
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    return result;
};

export { reorder, move }