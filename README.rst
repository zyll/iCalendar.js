iCalendar.js
============

This is some code I wrote to parse and generate RFC5545 in Javascript. It's
not finished, and currently only contains parsing for the values, and not the
properties and their parameters.


Design decisions
----------------

One major design decision was to store the iCalendar value as is, instead of
storing is in some parsed form. The reason for that is that parsing an
iCalendar file should go fast, and re-generating it should result in only
changing the values that you actually changed.

This means that retreiving the parsed data is done via a method, that in the
case of complex values such as Durations or RRULEs will return an object with
various attributes. This can be seen as an extra step, but the alternatives
would have necessited more parsing/generating. This makes it simple and fast,
even though the API might not be the prettiest possible.

It also means that it is not the fastest and most efficient way to store
calendar data, internally or otherwise. iCalendar.js purpose is to parse and
generate RFC5545 files. It is not a generic calendaring object, and it
performs little or no consistency checks.


Considerations
--------------

Maybe getValue() should *always* return a mapping, for consistency, even when
it's only one object?


Contributors
------------

Author: Lennart Regebro, regebro@gmail.com
