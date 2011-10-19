/*jslint indent: 4 */
/*global iCalendar: false, ok: false, module: false, test: false, expect: false, raises: false */

module("iCalendar.js");

test("iCalendar to content lines", function () {
    var ICAL = ["ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT:mailto:",
        "\tjsmith@example.com",
        "ATTACH;FMTTYPE=text/plain;ENCODING=BASE64;VALUE=BINARY:TG9yZW",
        " 0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW",
        " 5nIGVsaXQsIHNlZCBkbyBlaXVzbW9kIHRlbXBvciBpbmNpZGlkdW50IHV0IG",
        " xhYm9yZSBldCBkb2xvcmUgbWFnbmEgYWxpcXVhLiBVdCBlbmltIGFkIG1pbm",
        " ltIHZlbmlhbSwgcXVpcyBub3N0cnVkIGV4ZXJjaXRhdGlvbiB1bGxhbWNvIG",
        " xhYm9yaXMgbmlzaSB1dCBhbGlxdWlwIGV4IGVhIGNvbW1vZG8gY29uc2VxdW",
        " F0LiBEdWlzIGF1dGUgaXJ1cmUgZG9sb3IgaW4gcmVwcmVoZW5kZXJpdCBpbi",
        " B2b2x1cHRhdGUgdmVsaXQgZXNzZSBjaWxsdW0gZG9sb3JlIGV1IGZ1Z2lhdC",
        " BudWxsYSBwYXJpYXR1ci4gRXhjZXB0ZXVyIHNpbnQgb2NjYWVjYXQgY3VwaW",
        " RhdGF0IG5vbiBwcm9pZGVudCwgc3VudCBpbiBjdWxwYSBxdWkgb2ZmaWNpYS",
        " BkZXNlcnVudCBtb2xsaXQgYW5pbSBpZCBlc3QgbGFib3J1bS4=",
        "BEGIN:VCALENDAR",
        "PRODID:-//xyz Corp//NONSGML PDA Calendar Version 1.0//EN",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "DTSTAMP:19960704T120000Z",
        "UID:uid1@example.com",
        "ORGANIZER:mailto:jsmith@example.com",
        "DTSTART:19960918T143000Z",
        "DTEND:19960920T220000Z",
        "STATUS:CONFIRMED",
        "CATEGORIES:CONFERENCE",
        "SUMMARY:Networld+Interop Conference",
        "DESCRIPTION:Networld+Interop Conference",
        "  and Exhibit\\nAtlanta World Congress Center\\n",
        " Atlanta\\, Georgia",
        "END:VEVENT",
        "END:VCALENDAR"].join('\r\n');

    var TARGET = ["ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT:mailto:jsmith@example.com",
        "ATTACH;FMTTYPE=text/plain;ENCODING=BASE64;VALUE=BINARY:TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQsIHNlZCBkbyBlaXVzbW9kIHRlbXBvciBpbmNpZGlkdW50IHV0IGxhYm9yZSBldCBkb2xvcmUgbWFnbmEgYWxpcXVhLiBVdCBlbmltIGFkIG1pbmltIHZlbmlhbSwgcXVpcyBub3N0cnVkIGV4ZXJjaXRhdGlvbiB1bGxhbWNvIGxhYm9yaXMgbmlzaSB1dCBhbGlxdWlwIGV4IGVhIGNvbW1vZG8gY29uc2VxdWF0LiBEdWlzIGF1dGUgaXJ1cmUgZG9sb3IgaW4gcmVwcmVoZW5kZXJpdCBpbiB2b2x1cHRhdGUgdmVsaXQgZXNzZSBjaWxsdW0gZG9sb3JlIGV1IGZ1Z2lhdCBudWxsYSBwYXJpYXR1ci4gRXhjZXB0ZXVyIHNpbnQgb2NjYWVjYXQgY3VwaWRhdGF0IG5vbiBwcm9pZGVudCwgc3VudCBpbiBjdWxwYSBxdWkgb2ZmaWNpYSBkZXNlcnVudCBtb2xsaXQgYW5pbSBpZCBlc3QgbGFib3J1bS4=",
        "BEGIN:VCALENDAR",
        "PRODID:-//xyz Corp//NONSGML PDA Calendar Version 1.0//EN",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "DTSTAMP:19960704T120000Z",
        "UID:uid1@example.com",
        "ORGANIZER:mailto:jsmith@example.com",
        "DTSTART:19960918T143000Z",
        "DTEND:19960920T220000Z",
        "STATUS:CONFIRMED",
        "CATEGORIES:CONFERENCE",
        "SUMMARY:Networld+Interop Conference",
        "DESCRIPTION:Networld+Interop Conference and Exhibit\\nAtlanta World Congress Center\\nAtlanta\\, Georgia",
        "END:VEVENT",
        "END:VCALENDAR"];

    ok(iCalendar.iCalToContentlines(ICAL).join() === TARGET.join());

});

test("Binary data type", function () {
    expect(4);
    
    var d = new iCalendar.Binary();
    d.fromiCal("TG9yZW0gaXBzdW0gKHdlbGwsIHdoYXQgZGlkIHlvdSBleHBlY3Q/KQ==");
    ok(d.toiCal() === "TG9yZW0gaXBzdW0gKHdlbGwsIHdoYXQgZGlkIHlvdSBleHBlY3Q/KQ==");
    ok(d.getValue() === "Lorem ipsum (well, what did you expect?)");
    d.setValue("This is a bit of plain text.");
    ok(d.toiCal() === "VGhpcyBpcyBhIGJpdCBvZiBwbGFpbiB0ZXh0Lg==");
    ok(d.getValue() === "This is a bit of plain text.");
});

test("Boolean data type", function () {
    expect(9);
    
    var d = new iCalendar.Boolean();
    d.fromiCal("TRUE");
    ok(d.toiCal() === "TRUE");
    ok(d.getValue() === true);
    d.fromiCal("FALSE");
    ok(d.toiCal() === "FALSE");
    ok(d.getValue() === false);
    d.setValue(true);
    ok(d.toiCal() === "TRUE");
    ok(d.getValue() === true);
    d.setValue(false);
    ok(d.toiCal() === "FALSE");
    ok(d.getValue() === false);
    
    // Error:
    d.fromiCal("INVALID");
    raises(function () {d.getValue(); }, /Boolean must be/);
});

test("CalAddress data type", function () {
    expect(4);
    
    var d = new iCalendar.CalAddress();
    d.fromiCal("mailto:jane_doe@example.com");
    ok(d.toiCal() === "mailto:jane_doe@example.com");
    ok(d.getValue() === "mailto:jane_doe@example.com");
    d.setValue("mailto:jane_doe@example.com");
    ok(d.toiCal() === "mailto:jane_doe@example.com");
    ok(d.getValue() === "mailto:jane_doe@example.com");
});


test("Date data type", function () {
    expect(3);
    
    var d = new iCalendar.Date();
    //Remember that JavaScript is stupid and that January is 0.
    var date = new Date(1997, 6, 14);
    d.fromiCal("19970714");
    ok(d.getValue().valueOf() === date.valueOf());
    d.setValue(date);
    ok(d.toiCal() === "19970714");
    ok(d.getValue().valueOf() === date.valueOf());
});

test("DateTime data type", function () {
    expect(9);
    
    var d = new iCalendar.DateTime();
    //Remember that JavaScript is stupid and that January is 0.
    var date = new Date(1997, 6, 14, 12, 0, 0);
    d.fromiCal("19970714T120000");
    ok(d.getValue().valueOf() === date.valueOf());
    d.setValue(date);
    ok(d.toiCal() === "19970714T120000");
    ok(d.getValue().valueOf() === date.valueOf());

    // Having a Z at the end means it's UTC:
    d.fromiCal("19970714T120000Z");
    ok(d.timezone === 'UTC');
    
    // Setting it to UTC means a Z on the end:
    d = new iCalendar.DateTime('UTC');
    d.setValue(date);
    ok(d.toiCal() === "19970714T120000Z");
    ok(d.getValue().valueOf() === date.valueOf());

    // Any other timezone, and the Z stays off:
    d = new iCalendar.DateTime('Europe/Paris');
    d.setValue(date);
    ok(d.toiCal() === "19970714T120000");
    ok(d.getValue().valueOf() === date.valueOf());

    // A timezone parameter and a Z raises an error:
    d = new iCalendar.DateTime('Europe/Paris');
    d.fromiCal("19970714T120000Z");
    raises(function () {d.getValue(); }, /DateTime is in UTC format/);
    
});


test("Duration data type", function () {
    expect(24);
    
    var d = new iCalendar.Duration();
    d.fromiCal("P15DT5H0M20S");
    var v = d.getValue();
    ok(v.negative === false);
    ok(v.weeks === 0);
    ok(v.days === 15);
    ok(v.hours === 5);
    ok(v.minutes === 0);
    ok(v.seconds === 20);
    
    d = new iCalendar.Duration();
    d.fromiCal("PT15M");
    v = d.getValue();
    ok(v.negative === false);
    ok(v.weeks === 0);
    ok(v.days === 0);
    ok(v.hours === 0);
    ok(v.minutes === 15);
    ok(v.seconds === 0);

    d = new iCalendar.Duration();
    d.fromiCal("-P2D");
    v = d.getValue();
    ok(v.negative === true);
    ok(v.weeks === 0);
    ok(v.days === 2);
    ok(v.hours === 0);
    ok(v.minutes === 0);
    ok(v.seconds === 0);
    
    d = new iCalendar.Duration();
    d.fromiCal("-PT30M");
    v = d.getValue();
    ok(v.negative === true);
    ok(v.weeks === 0);
    ok(v.days === 0);
    ok(v.hours === 0);
    ok(v.minutes === 30);
    ok(v.seconds === 0);
});

test("Float data type", function () {
    expect(4);
    
    var d = new iCalendar.Float();
    d.fromiCal("1000000.0000001");
    ok(d.getValue() === 1000000.0000001);
    d.setValue(1000000.0000001);
    ok(d.toiCal() === "1000000.0000001");
    d.fromiCal("-3.14");
    ok(d.getValue() === -3.14);
    d.setValue(-3.14);
    ok(d.toiCal() === "-3.14");
});

test("Int data type", function () {
    expect(5);
    
    var d = new iCalendar.Integer();
    d.fromiCal("1234567890");
    ok(d.getValue() === 1234567890);
    d.setValue(1234567890);
    ok(d.toiCal() === "1234567890");
    d.fromiCal("+1234567890");
    ok(d.getValue() === 1234567890);
    d.setValue(-1234567890);
    ok(d.toiCal() === "-1234567890");
    d.fromiCal("-1234567890");
    ok(d.getValue() === -1234567890);
});

test("Period data type", function () {
    expect(9);
    
    var start = new Date(1997, 0, 1, 18, 0, 0);
    var end = new Date(1997, 0, 2, 7, 0, 0);
    var d = new iCalendar.Period();
    
    d.fromiCal("19970101T180000Z/19970102T070000Z");
    ok(d.timezone === 'UTC');
    var v = d.getValue();
    ok(v.start.valueOf() === start.valueOf());
    ok(v.end.valueOf() === end.valueOf());

    d = new iCalendar.Period();
    d.setValue({start: start, end: end});
    ok(d.toiCal() === "19970101T180000/19970102T070000");
        
    d = new iCalendar.Period('UTC');
    d.setValue({start: start, end: end});
    ok(d.toiCal() === "19970101T180000Z/19970102T070000Z");

    d.fromiCal("19970101T180000Z/PT5H30M");
    v = d.getValue();
    ok(v.start.valueOf() === start.valueOf());
    ok(v.end.hours === 5);
    ok(v.end.minutes === 30);
    ok(v.end.negative === false);
    
});

test("Recur data type", function () {
    expect(21);
    
    var d = new iCalendar.Recur();
    d.fromiCal("FREQ=DAILY;COUNT=10;INTERVAL=2");
    var v = d.getValue();
    ok(v.FREQ === 'DAILY');
    ok(v.COUNT === 10);
    ok(v.INTERVAL === 2);
    
    d.fromiCal("FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1");
    v = d.getValue();
    ok(v.FREQ === 'MONTHLY');
    ok(v.BYDAY.join() === ['MO', 'TU', 'WE', 'TH', 'FR'].join());
    ok(v.BYSETPOS.join() === "-1");

    d.fromiCal("FREQ=YEARLY;BYMONTH=4;BYDAY=-1SU;UNTIL=19730429T070000Z");
    v = d.getValue();
    ok(v.FREQ === 'YEARLY');
    ok(v.BYMONTH.join() === "4");
    ok(v.BYDAY.join() === '-1SU');
    ok(v.UNTIL.valueOf() === new Date(1973, 3, 29, 7, 0, 0).valueOf());
        
    d.fromiCal("FREQ=YEARLY;INTERVAL=2;BYMONTH=1;BYDAY=SU;BYHOUR=8,9;BYMINUTE=30");
    v = d.getValue();
    ok(v.FREQ === 'YEARLY');
    ok(v.INTERVAL === 2);
    ok(v.BYMONTH.join() === "1");
    ok(v.BYDAY.join() === 'SU');
    ok(v.BYHOUR.join() === '8,9');
    ok(v.BYMINUTE.join() === '30');
    
    
    d.fromiCal("FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU;UNTIL=20061029T060000Z");
    v = d.getValue();
    ok(v.FREQ === 'YEARLY');
    // We skip the normal join() here to verify that it's really [10]:
    ok(v.BYMONTH.length === 1);
    ok(v.BYMONTH[0] === 10);
    ok(v.BYDAY.join() === '-1SU');
    ok(v.UNTIL.valueOf() === new Date(2006, 9, 29, 6, 0, 0).valueOf());
});

test("Text data type", function () {
    expect(6);
    var d = new iCalendar.Text();
    d.fromiCal("-//ABC Corporation//NONSGML My Product//EN");
    ok(d.getValue() === "-//ABC Corporation//NONSGML My Product//EN");
    d.setValue("-//ABC Corporation//NONSGML My Product//EN");
    ok(d.toiCal() === "-//ABC Corporation//NONSGML My Product//EN");
    
    d.fromiCal("Conference Room - F123\\, Bldg. 002");
    ok(d.getValue() === "Conference Room - F123, Bldg. 002");
    d.setValue("Conference Room - F123, Bldg. 002");
    ok(d.toiCal() === "Conference Room - F123\\, Bldg. 002");
    
    d.fromiCal("Look\\; I'm telling you now: \"This has many\\, many different types of punctuation.\\nAnd \\\\control\\\\ characters!\"\\N");
    ok(d.getValue() === "Look; I'm telling you now: \"This has many, many different types of punctuation.\nAnd \\control\\ characters!\"\n");
    d.setValue("Look; I'm telling you now: \"This has many, many different types of punctuation.\nAnd \\control\\ characters!\"\n");
    ok(d.toiCal() === "Look\\; I'm telling you now: \"This has many\\, many different types of punctuation.\\nAnd \\\\control\\\\ characters!\"\\n");
    
});

test("Time data type", function () {
    expect(14);
    
    var d = new iCalendar.Time();
    d.fromiCal("083000");
    var v = d.getValue();
    ok(v.hour === 8);
    ok(v.minute === 30);
    ok(v.second === 0);
    
    d = new iCalendar.Time();
    d.setValue({hour: 8, minute: 30, second: 0});
    ok(d.toiCal() === "083000");
    
    d = new iCalendar.Time();
    d.fromiCal("133000Z");
    ok(d.timezone === 'UTC');
    v = d.getValue();
    ok(v.hour === 13);
    ok(v.minute === 30);
    ok(v.second === 0);
    
    d = new iCalendar.Time('UTC');
    d.setValue({hour: 13, minute: 30, second: 0});
    ok(d.toiCal() === "133000Z");

    d = new iCalendar.Time("America/New_York");
    d.fromiCal("083000");
    ok(d.timezone === 'America/New_York');
    v = d.getValue();
    ok(v.hour === 8);
    ok(v.minute === 30);
    ok(v.second === 0);
    
    d = new iCalendar.Time('America/New_York');
    d.setValue({hour: 8, minute: 30, second: 0});
    ok(d.toiCal() === "083000");
    
});

test("URI data type", function () {
    expect(2);
    
    var d = new iCalendar.URI();
    d.fromiCal("http://example.com/my-report.txt");
    ok(d.getValue() === "http://example.com/my-report.txt");
    d.setValue("http://example.com/my-report.txt");
    ok(d.toiCal() === "http://example.com/my-report.txt");
});

test("UTCOffset data type", function () {
    expect(8);
    
    var d = new iCalendar.UTCOffset();
    d.fromiCal("-0500");
    ok(d.getValue() === -5 * 3600);
    d.setValue(-5 * 3600);
    ok(d.toiCal() === "-0500");
    
    d.fromiCal("+0345");
    ok(d.getValue() === 13500);
    d.setValue(13500);
    ok(d.toiCal() === "+0345");

    d.fromiCal("-0345");
    ok(d.getValue() === -13500);
    d.setValue(-13500);
    ok(d.toiCal() === "-0345");
    
    d.fromiCal("+000005");
    ok(d.getValue() === 5);
    d.setValue(5);
    ok(d.toiCal() === "+000005");
});

test("Content line parsing", function () {
    expect(6);
    
    var p = new iCalendar.Property();
    p.parse('DESCRIPTION:This is really simple and with no quotes or anything');
    ok(p.name === 'DESCRIPTION');
    ok(p.value === "This is really simple and with no quotes or anything");
        
    p = new iCalendar.Property();
    p.parse('DESCRIPTION;ALTREP="cid:part1.0001@example.org";X-FOO="Semicolon; works":The Fall\'98 Wild "Wizards" Conference: - Las Vegas\\, NV; USA');
    ok(p.name === 'DESCRIPTION');
    ok(p.value === "The Fall\'98 Wild \"Wizards\" Conference: - Las Vegas\\, NV; USA");
    // This is not unquoted, as I'm doing this on a Property() and not a
    // Description(). Properties don't know what to quote and not.
    ok(p.parameters.ALTREP === '"cid:part1.0001@example.org"');
    ok(p.parameters['X-FOO'] === '"Semicolon; works"');
    
});
