export function timeAgo(postedTime) {
    const now = new Date();
    const diffInMs = now - new Date(postedTime);

    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSecs < 60) {
        return `${diffInSecs} s`;
    } else if (diffInMins < 60) {
        return `${diffInMins} m`;
    } else if (diffInHours < 24) {
        return `${diffInHours} h`;
    } else if (diffInDays < 7) {
        return `${diffInDays} d`;
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks} w`;
    } else if (diffInMonths < 12) {
        return `${diffInMonths} mo`;
    } else {
        return `${diffInYears} <i class="fa fa-youtube" aria-hidden="true"></i>`;
    }
}
