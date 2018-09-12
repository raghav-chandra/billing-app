export const clone = (data) =>{
    return data == null ? null : JSON.parse(JSON.stringify(data));
}


export const keyValueMap = (allItems, key, value) => {
    let data = {};
    allItems.forEach(item=>{
        data[item[key]] = item[value];
    });
    return data;
}