export function getCount(param) {
    if (param == undefined || param == null) return 0;
    return param.length;
}
export function getPlays(plays) {
    if (plays == undefined || plays == null) {
        return 0;
    } else {
        let count = 0;
        plays.map(p => {
            count = count + p.count;
        })
        return count;
    }
    

}