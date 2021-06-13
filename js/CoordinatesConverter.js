function _getDMS(latitude) {
    let valDeg, valMin, valSec, result;
    latitude = Math.abs(latitude);
    valDeg = Math.floor(latitude);
    result = valDeg + "º";
    valMin = Math.floor((latitude - valDeg) * 60);
    result += valMin + "'";
    valSec = Math.round((latitude - valDeg - valMin / 60) * 3600 * 1000) / 1000;
    result += valSec + '"';
    return result;
};

export function getLatitude(latitude) {
    if (!latitude) {
        return '';
    }
    const latResult = latitude >= 0 ? "N" : "S";
    return `${latResult}${_getDMS(latitude)}`;
};

export function getLongitude(longitude) {
    if (!longitude) {
        return '';
    }
    const longResult = longitude >= 0 ? "E" : "W";
    return `${longResult}${_getDMS(longitude)}`;
};