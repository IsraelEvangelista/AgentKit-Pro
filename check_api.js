const https = require('https');

const url = "https://skillsmp.com/api/v1/skills/ai-search?q=ark-ui";

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.data && json.data.length > 0) {
          const item = json.data[0];
          console.log("Keys:", Object.keys(item));
          if (item.data) console.log("Nested Data Keys:", Object.keys(item.data));
          console.log("Content present?", !!item.content);
          console.log("Readme present?", !!item.readme);
          console.log("Nested content?", item.data ? !!item.data.content : false);
          console.log("Nested readme?", item.data ? !!item.data.readme : false);
      } else {
          console.log("No data found");
      }
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
