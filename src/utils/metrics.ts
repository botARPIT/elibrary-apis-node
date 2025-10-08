import { Counter, Gauge, Histogram } from "prom-client";

const httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total number of http requests',
    labelNames: ['method', 'route', 'status_code']
})

const httpDuration = new Histogram({
    name: 'http_requests_duration_seconds',
    help: 'Duration of http requests on an endpoint',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 50]
})

const activeConnections = new Gauge({
    name: 'active_users',
    help: 'Total number of active users at a particular time',

})



export { httpRequests, httpDuration, activeConnections }