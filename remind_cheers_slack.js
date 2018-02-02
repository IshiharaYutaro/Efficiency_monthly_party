var guestYes = 0;
var guestMaybe = 0;
var guestNo = 0;
var guestInvited = 0;
//検索するイベント名を指定
var searchEventName = "";

function remind_slack() {
    const calendars = CalendarApp.getDefaultCalendar();
    const startTime = new Date();
    //何日前の予定を取って来るか指定
    const endTime = new Date(startTime.getTime() + ((24 * 60 * 60 * 1000) * 31));
    //カレンダータイトルをsearchで設定
    const getCalendar = calendars.getEvents(startTime, endTime, {
        search: searchEventName
    });
    //イベントから何日前に通知してほしいか決める。
    const notifyRemainDay = [3, 1];
    var notifyTime = new Date();
    if (getCalendar.length > 0) {
        for (var i = 0; i < getCalendar.length; i++) {
            //notifyRemainDayの間かどうか比較してる
            for (var s = 0; s < notifyRemainDay.length; s++) {
                if (new Date(notifyTime.getTime() + ((24 * 60 * 60 * 1000) * notifyRemainDay[s])) <= getCalendar[i].getStartTime() && getCalendar[i].getStartTime() < new Date(notifyTime.getTime() + ((24 * 60 * 60 * 1000) * (notifyRemainDay[s] + 1)))) {
                    var guestStatus = getCalendar[i].getGuestList(true);
                    countJoin(getCalendar, guestStatus);
                    //slackメッセージを指定
                    var slackMessage = 'hoge';
                    sendSlack(slackMessage);
                }
            }
        }
    }
}

//お疲れ様連絡(毎分実行だけど、0分のときのみしか通知が行かないように変更)
function cheers_slack() {
    var timeSet = new Date();
    if (timeSet.getMinutes() == 0) {
        const calendars = CalendarApp.getDefaultCalendar();
        //イベント終了何時間後にお疲れ様メールを流すか
        var notifyRemainHour = 1;
        const startTime = new Date(timeSet - ((60 * 60 * 1000) * notifyRemainHour));
        //何日前の予定を取って来るか指定
        const endTime = new Date();
        //カレンダータイトルをsearchで設定
        const getCalendar = calendars.getEvents(startTime, endTime, {search: searchEventName});
        for (var i = 0; i < getCalendar.length; i++) {
            var notifyTime = new Date();
            if (getCalendar[i].getEndTime() <= new Date(notifyTime.getTime() + ((60 * 60 * 1000) * (notifyRemainHour)))) {
                var slackMessage = "飲み会お疲れ様!!!!来月もよろしく！！！"
                sendSlack(slackMessage);
            }
        }
    }
}




//人数カウントする
function countJoin(getCalendar, guestStatus) {
    //なんかスイッチ文でいけなかったので、汚くなった。
    for (var j = 0; j < guestStatus.length; j++) {
        Logger.log(guestStatus[j].getEmail());
        if (guestStatus[j].getGuestStatus() == 'YES') {
            guestYes++;
        } else if (guestStatus[j].getGuestStatus() == 'MAYBE') {
            guestMaybe++;
        } else if (guestStatus[j].getGuestStatus() == 'NO') {
            guestNo++;
        } else {
            guestInvited++;
        }
    }

}

//slack送るためのファンクション
function sendSlack(message) {
    var postUrl = 'Incoming WebHooksで発行されたURL';
    var username = ''; // 通知時に表示されるユーザー名
    var icon = ''; // 通知時に表示されるアイコン
    var jsonData = {
        "username": username,
        "icon_emoji": icon,
        "text": message
    };
    var payload = JSON.stringify(jsonData);

    var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": payload
    };

    UrlFetchApp.fetch(postUrl, options);
}
