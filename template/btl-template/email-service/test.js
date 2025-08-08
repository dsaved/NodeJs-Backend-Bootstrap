const { runner } = require("./index");

const events = {
  Records: [
    {
      body: JSON.stringify({
        type: "email",
        emailId: 1,
      }),
    },
  ],
};

runner(events, null);