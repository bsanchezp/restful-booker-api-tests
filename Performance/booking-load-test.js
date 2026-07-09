import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',

    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01']
    }
};

export default function () {

    const res = http.get('https://restful-booker.herokuapp.com/booking');

    check(res, {
        'Status is 200': (r) => r.status === 200
    });

}