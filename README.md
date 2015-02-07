# DataMother.js

DataMother.js will be a data management and injection tool to ease the burden of managing data in
unit test files and shorten the time to produce high quality unit tests through using familiar
programming patterns like registering objects and declaring dependent behaviors.

DataMother.js will tentatively be released under the MIT license and will always be free (as in speech and beer) software.

DataMother.js will follow the to-do list below.  This is the first round of to-dos and it may grow
or change over time.

- [x] Register data objects -- register(key, value);
- [x] Get a single instance of a data object -- get(key, options);
- [x] Get an array of instances of a single data object -- getArrayOf(key, options);
- [x] Handle initialization functions and static values as defined in data object mother files (Motherfiles)
- [ ] Resolve options passed to build functions
