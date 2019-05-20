import Moment from 'moment';
export const calDiffDays = (start) => {
    let _start = Moment(start).utcOffset(2);
    let _end = Moment().utcOffset(2);
    let dif = Moment(_end).diff(_start, 'days');
    return dif;
}

export const calDiffHours = (start) => {
    let _start = Moment(start).utcOffset(2);
    let _end = Moment().utcOffset(2);
    let dif = Moment(_end).diff(_start, 'hours');
    return dif;
}
