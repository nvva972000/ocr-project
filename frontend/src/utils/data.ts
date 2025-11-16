
type ParsedCurl = {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
    cookies: Record<string, string>;
    query: Record<string, string>;
    auth: { username: string; password: string };
    contentType: string;
    accept: string;
    userAgent: string;
    pathVariables: Record<string, string>;
};

export const extractTestDataDetail = (curl: string): ParsedCurl => {
    try {
        // Chuẩn hóa chuỗi curl
        curl = curl
            .replace(/\\\s*<br\s*\/?>/gi, ' ')
            .replace(/\\\n/g, ' ')
            .replace(/\\$/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Method
        let method = 'GET';
        // Cải thiện regex để xử lý cả trường hợp có dấu nháy
        const methodMatch = curl.match(/-X\s*['"]?(\w+)['"]?/i) || curl.match(/--request\s*['"]?(\w+)['"]?/i);
        if (methodMatch) {
            method = methodMatch[1].toUpperCase();
        } else {
            // Nếu có -d/--data/--data-raw mà không có -X thì là POST
            if (/(\s-d\s+|\s--data\s+|\s--data-raw\s+)/i.test(curl)) {
                method = 'POST';
            }
        }

        // URL
        const urlMatch = curl.match(/curl.*?['"]?(https?:\/\/[^\s'"]+)/i);
        const url = urlMatch ? urlMatch[1] : '';

        // Headers
        const headerRegex = /--header\s+'([^']+)'|--header\s+"([^"]+)"|-H\s+'([^']+)'|-H\s+"([^"]+)"/gi;
        let headers: Record<string, string> = {};
        let match;
        while ((match = headerRegex.exec(curl)) !== null) {
            const h = match[1] || match[2] || match[3] || match[4];
            const [key, ...rest] = h.split(':');
            headers[key.trim()] = rest.join(':').trim();
        }

        // Body
        const dataMatch = curl.match(/--data-raw\s+'([^']+)'|--data-raw\s+"([^"]+)"|--data\s+'([^']+)'|--data\s+"([^"]+)"|-d\s+'([^']+)'|-d\s+"([^"]+)"/i);
        let body = dataMatch ? (dataMatch[1] || dataMatch[2] || dataMatch[3] || dataMatch[4] || dataMatch[5] || dataMatch[6]) : '';
        if (body) {
            try {
                body = body.replace(/<br \/>/g, '\n');
                body = JSON.parse(body);
            } catch (e) {
                body = JSON.stringify(body);
            }
        }

        // Cookies
        let cookies: Record<string, string> = {};
        if (headers['Cookie']) {
            headers['Cookie'].split(';').forEach(cookie => {
                const [k, v] = cookie.split('=');
                if (k && v) cookies[k.trim()] = v.trim();
            });
        }

        // Query params
        let query: Record<string, string> = {};
        if (url.includes('?')) {
            const queryString = url.split('?')[1];
            queryString.split('&').forEach(pair => {
                const [k, v] = pair.split('=');
                if (k) query[k] = v || '';
            });
        }
        // Path Variables
        let pathVariables: Record<string, string> = {};
        if (url.includes('/')) {
            const path = url.split('/');
            path.forEach((p, index) => {
                if (p.includes('{')) {
                    pathVariables[p] = path[index + 1];
                }
            });
        }
        // Auth
        let auth = { username: '', password: '' };
        const authMatch = curl.match(/-u\s+['"]?([^:'"]+):([^'"]+)['"]?/i) || curl.match(/--user\s+['"]?([^:'"]+):([^'"]+)['"]?/i);
        if (authMatch) {
            auth = { username: authMatch[1], password: authMatch[2] };
        }

        // Content-Type, Accept, User-Agent
        const contentType = headers['Content-Type'] || '';
        const accept = headers['Accept'] || '';
        const userAgent = headers['User-Agent'] || '';

        // Đảm bảo luôn trả về đủ trường
        return {
            method,
            url,
            headers,
            body,
            cookies,
            query,
            auth,
            contentType,
            accept,
            userAgent,
            pathVariables,
        };
    } catch (e) {
        return {
            method: '',
            url: '',
            headers: {},
            body: '',
            cookies: {},
            query: {},
            auth: { username: '', password: '' },
            contentType: '',
            accept: '',
            userAgent: '',
            pathVariables: {},
        }
    }
}