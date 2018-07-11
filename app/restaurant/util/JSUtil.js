export const clone = (data) =>{
    return data == null ? null : JSON.parse(JSON.stringify(data));
}