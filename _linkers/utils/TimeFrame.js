

class TimeFrame {
    /**
     * 
     * @param {Date} startDate 
     * @param {Date} endDate  
     * @param {string} stringDate - must be in format "dd-mm-yyyy to dd-mm-yyyy"
     */
    constructor(startDate, endDate, stringDate){ 
        if (stringDate == undefined) {
            this.startDate = startDate; 
            this.endDate = endDate;  
        } else {

        }
    } 

    /**
     * Checks if the two timeframes overlaps
     * @param {TimeFrame} timeFrame 
     * @returns True if they overlap, false otherwise. 
     */
    isOverlapping(timeFrame) {
        return this.isBetween(timeFrame.startDate) || this.isBetween(timeFrame.endDate);
    } 

    /**
     * Checks if a date is between the bounds of the timeframe. 
     * @param {Date} date 
     */
    isBetween(date) {
        return date >= this.startDate && date <= this.endDate; 
    }

    dateToString(date){
        return date.getDate().toString().padStart(2,'0') + "-" + (date.getMonth()+1).toString().padStart(2,'0') + "-" + date.getFullYear().toString();  
    }

    toString(){
        return this.dateToString(this.startDate) + " to " + this.dateToString(this.endDate);
    } 

} 

module.exports = {TimeFrame}; 