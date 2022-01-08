const axios = require('axios');

const consumer_key = '<consumer_key>';
const access_token= '<access_token>';

const webhook_url = 'https://hooks.slack.com/hogehoge';
const number_of_articles = 5;

async function get(consumer_key, access_token) {
    try {
        const response = await axios.get('https://getpocket.com/v3/get', {
            params: {
                consumer_key,
                access_token,
                detailType: 'complete',
            }
        });
        return response.data.list;
    } catch (error) {
        console.error(error);
    }
}

function convert(item) {
    const json = {};
    const blocks = [];
    const title = item.given_title !== '' ? item.given_title : item.resolved_title;
    const added = new Date(parseInt(item.time_added) * 1000);
    const added_str = `${added.getFullYear()}/${added.getMonth()+1}/${added.getDate()}`;
    const tags_str = item.tags ? `${Object.keys(item.tags).join(', ')}\n` : '';
    blocks.push({
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `<${item.given_url}|${title}>\n${added_str}${item.favorite === '1' ? ' :star: ': ''}\n${tags_str}> ${item.excerpt}\n<https://getpocket.com/ja/read/${item.item_id}|open in pocket>`,
        },
    });
    json.blocks = blocks;
    return json;
}

function choose_ramndomly(items) {
    const keys = Object.keys(items);
    const rand = Math.floor(Math.random() * keys.length);
    const target = keys[rand];
    return items[target];
}

async function notify_slack(webhook_url, data) {
    try {
        const response = await axios.post(webhook_url, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error(error);
    }
 
}

async function main() {
    const items = await get(consumer_key, access_token);
    const keys = Object.keys(items);
    for (let i=0; i<number_of_articles; i++) {
        const json = convert(choose_ramndomly(items));
        await notify_slack(webhook_url, json);
    }
}

main();