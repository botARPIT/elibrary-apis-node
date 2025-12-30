import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe("Test for /health endpoint", () => {
    it("should return 200 and OK", async () => {
        const res = await request(app).get("/health")
        expect(res.status).toBe(200)
        expect(res.body).toEqual({ "message": "OK" })
    })
})