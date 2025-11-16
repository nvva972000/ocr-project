
export function formatVietnameseDate(dateString: string) {
    try {
        const date = new Date(dateString);

        const weekdays = [
            "Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4",
            "Thứ 5", "Thứ 6", "Thứ 7"
        ];

        const weekday = weekdays[date.getDay()];
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        return `${weekday}, ${day}/${month}/${year}`;
    } catch (error) {
        return 'Invalid date';
    }
}

export function formatEnglishDateTime(dateString: string, haveDayOfWeek: boolean = false) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return null;
        }
        const weekdays = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        const weekday = weekdays[date.getDay()];
        const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
        const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        const year = date.getFullYear();
        const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

        return `${haveDayOfWeek ? `${weekday}, ` : ""}${day}/${month}/${year} ${hour}:${minute}:${second}`;
    } catch (error) {
        return null;
    }
}

export function formatRelativeTime(dateString: string) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return formatEnglishDateTime(dateString, false);
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        // Nếu nhỏ hơn 1 phút (60 giây), hiển thị seconds
        if (diffInSeconds >= 0 && diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        }

        // Nếu nhỏ hơn 5 phút (300 giây), hiển thị minutes
        if (diffInSeconds >= 60 && diffInSeconds < 300) {
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            return `${diffInMinutes} minutes ago`;
        }

        // Ngược lại hiển thị format thông thường
        return formatEnglishDateTime(dateString, false);
    } catch (error) {
        return formatEnglishDateTime(dateString, false);
    }
}