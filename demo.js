import http from "k6/http";
import { sleep, check, group } from "k6";
import { Trend } from "k6/metrics";
import { tagWithCurrentStageIndex } from "https://jslib.k6.io/k6-utils/1.3.0/index.js";

//Custome metrics
const Get_method = new Trend("Get_method");
const Post_method = new Trend("Post_Method");

export const options = {
  // vus: 2,
  // duration: '10s',
  stages: [
    { duration: "1s", target: 1 },
    { duration: "1s", target: 1 },
    { duration: "1s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(95)<300"], // 95% of requests should be below 200ms
    http_req_duration: ["p(90) < 400", "p(95) < 300", "p(99.9) < 2000"], // 90% of requests must finish //within 400ms, 95% within 800, and 99.9% within 2s.
    http_req_connecting: [{ threshold: "p(99) < 2000", abortOnFail: true }],
    checks: [{ threshold: "rate>0.9", abortOnFail: true }],
  },
};

export default function () {
  group("Post method check", function () {
    tagWithCurrentStageIndex();
    const url = `https://${__ENV.MY_HOSTNAME}`;
    const payload = JSON.stringify({
      name: "Rohith",
      job: "AutomationTestEngineer",
    });

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = http.post(url, payload, params);
    const checkRes = check(res, {
      "status is 201": (r) => r.status === 201,
      "verify Name text": (r) => r.body.includes("Rohith"),
      "Verify Job": (r) => JSON.parse(r.body).job === "AutomationTestEngineer",
    });
    console.log("Response time was " + String(res.timings.duration) + " ms");
    console.log(res);
    let body1 = JSON.parse(res.body);
    console.log(`Status Text ${JSON.stringify(body1.job)}`);

    //Waiting time
    Post_method.add(res.timings.duration);
  });

  group("Get method check", function () {
    tagWithCurrentStageIndex();
    const url = "https://reqres.in/api/users?page=2";
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = http.get(url, params);
    const checkRes = check(res, {
      "status is 200": (r) => r.status === 200,
    });
    console.log("Response time was " + String(res.timings.duration) + " ms");
    //console.log(res);
    //Waiting time
    Get_method.add(res.timings.waiting);
  });
}
