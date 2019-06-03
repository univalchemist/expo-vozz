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

export const LastMsgTime = (value) => {
    let time = Moment(value).utcOffset(2);
    let now = Moment().utcOffset(2);
    let time_year = time.format("YYYY");
    let time_month = time.format("MM/DD");
    let time_time = time.format("HH:mm A");

    let now_year = now.format("YYYY");
    let now_month = now.format("MM/DD");
    let now_time = now.format("HH:mm A");

    if (time_year == now_year) {
        if(time_month == now_month) {
            return time_time;
        }
        return time_month;
    }
    return time_year + "/" + time_month + " " + time_time;
}
