function main() {
    createEventFromGmail("amazon.confirm", "amazon.confirm")
}


function createEventFromGmail(EventName, CalendarName) {

    // EventNameのラベルがついているメールスレッドを取り出す
    var threads = GmailApp.getUserLabelByName(EventName).getThreads();

    // それぞれのスレッドに関して
    for (var i = 0, thread; i < threads.length; i++) {
        thread = threads[i];

        // 含まれるメッセージを取り出し、
        var messages = thread.getMessages();
        // メールのリンクを取り出し、
        var permallink = thread.getPermalink();
        for (var j = 0, message; j < messages.length; j++) {
            var message = messages[j];
            // 本文を取り出して、
            var body = message.getBody();
            // メール受信日を取り出して、
            var sendYear = message.getDate().getFullYear();
            var date = body.match(/, (\d{1,2}\/\d{1,2})( \d{2}:\d{2})?/gm);
            date = date.map(function (element) {
                // amazonは年が記載されていないため補正
                var tmpDate = sendYear + "/" + element.slice(2);
                if (!tmpDate.match(/\d{2}:\d{2}/)) {
                    tmpDate += " 00:00";
                }
                return new Date(tmpDate);
            });
            // イベント開始・終了時刻
            var from = new Date(Math.min.apply(null, date));
            var to = new Date(Math.max.apply(null, date));
            // 追加したいCalendarNameという名前のカレンダーを取得し、
            var myCalendar = CalendarApp.getCalendarsByName(CalendarName)[0];
            // ちゃんと存在したら
            if (myCalendar) {
                // 同じ時刻に、同じイベント名で登録されているイベントを探してみて、
                var subject = message.getSubject();
                var existingEvents = myCalendar.getEvents(from, to, {search: subject});
                // なかったらイベントを作成する
                if (existingEvents.length == 0) {
                    myCalendar.createEvent(subject, from, to, {description: permallink});
                } else {
                    Logger.log(from);
                    Logger.log("イベント登録済みです");
                }
            } else {
                Logger.log("カレンダーが見つかりませんでした: " + CalendarName);
            }
        }
        // 繰り返し処理がされないためにラベルを削除
        thread.removeLabel(GmailApp.getUserLabelByName(EventName));
    }
}