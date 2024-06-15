"use strict";

const root = document.documentElement;
const fretboard = document.querySelector(".fretboard");
const instrumentSelector = document.querySelector("#instrument-selector");

const singleFretMarkPositions = [3, 5, 7, 9, 15, 17, 19, 21];
const doubleFretMarkPositions = [12, 24];
const accidentalSelector = document.querySelector(".accidental-selector");
const numberOfFretsSelector = document.querySelector("#number-of-frets");
const scaleSelector = document.querySelector("#scale-selector");
const noteNameSection = document.querySelector(".note-name-section");
const notes = {
  flats: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  sharps: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
};

let numberOfFrets = 20;

let accidentals = "flats";
let allNotes;

let noteFretsArray = [];

const instrumentTuningPresets = {
  Guitar: ["E", "B", "G", "D", "A", "E"].map((x) => {
    return notes[accidentals].indexOf(x);
  }),
  "Bass (4 strings)": [7, 2, 9, 4],
  "Bass (5 strings)": [7, 2, 9, 4, 11],
  Ukulele: [9, 4, 0, 7],
};

const scales = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
  "Major Pentatonic": [0, 2, 4, 7, 9],
};

let selectedScale = "Major";

let selectedInstrument = "Guitar";
let numberOfStrings = instrumentTuningPresets[selectedInstrument].length;

class APP {
  constructor() {
    this.setupFretboard();
    this.setupEventListeners();
    this.setupInstrumentSelector();
    this.setupScaleSelector();
    this.setupNoteNameSection();
  }

  setupFretboard() {
    fretboard.innerHTML = "";
    root.style.setProperty("--number-of-strings", numberOfStrings);
    noteFretsArray = [];

    // Add strings to fretboard
    for (let i = 0; i < numberOfStrings; i++) {
      let string = tools.createElement("div");
      noteFretsArray[i] = [];
      string.classList.add("string");

      // Create frets
      for (let fret = 0; fret <= numberOfFrets; fret++) {
        let noteFret = tools.createElement("div");
        noteFret.classList.add("note-fret");
        string.appendChild(noteFret);
        noteFretsArray[i][fret] = noteFret;

        let noteName = this.generateNoteNames(
          fret + instrumentTuningPresets[selectedInstrument][i]
        );
        noteFret.setAttribute("data-note", noteName);
        noteFret.addEventListener(
          "mouseover",
          this.toggleNoteDotFactory(i, fret, 1)
        );
        noteFret.addEventListener(
          "mouseout",
          this.toggleNoteDotFactory(i, fret, 0)
        );

        // Add single fret marks
        if (i === 0 && singleFretMarkPositions.indexOf(fret) !== -1) {
          noteFret.classList.add("single-fretmark");
        }

        if (i === 0 && doubleFretMarkPositions.indexOf(fret) !== -1) {
          let doubleFretMark = tools.createElement("div");
          doubleFretMark.classList.add("double-fretmark");
          noteFret.appendChild(doubleFretMark);
        }

        if (i === numberOfStrings - 1) {
          noteFret.classList.add("fretnum");
          noteFret.setAttribute("fret_num", fret);
        }
      }
      let stringLine = tools.createElement("div");
      stringLine.classList.add("string-line");
      string.appendChild(stringLine);
      fretboard.appendChild(string);

      // get --string-height from root style
      let stringHeight =
        getComputedStyle(root).getPropertyValue("--string-height");

      stringLine.style.setProperty("height", `${Number(stringHeight) + i}px`);
    }
    allNotes = document.querySelectorAll(".note-fret");
  }

  generateNoteNames(noteIndex) {
    return notes[accidentals][noteIndex % 12];
  }

  setSelectedInstrument(event) {
    selectedInstrument = event.target.value;
    numberOfStrings = instrumentTuningPresets[selectedInstrument].length;
    this.setupFretboard();
    this.setupNoteNameSection();
  }

  setscaleSelector(event) {
    selectedScale = event.target.value;
  }

  setupInstrumentSelector() {
    for (let instrument in instrumentTuningPresets) {
      let instrumentOption = tools.createElement("option", instrument);
      instrumentSelector.appendChild(instrumentOption);
    }
  }

  setupScaleSelector() {
    for (let scale in scales) {
      let scaleOption = tools.createElement("option", scale);
      scaleSelector.appendChild(scaleOption);
    }
  }

  setAccidentals(event) {
    if (event.target.classList.contains("acc-select")) {
      accidentals = event.target.value;
      this.setupFretboard();
      this.setupNoteNameSection();
    } else {
      return;
    }
  }
  setNumberOfFrets(event) {
    numberOfFrets = event.target.value;
    this.setupFretboard();
    this.setupNoteNameSection();
  }

  toggleSameNotes(noteName, opacity) {
    for (let i = 0; i < allNotes.length; i++) {
      if (noteName === "*") {
        allNotes[i].style.setProperty("--noteDotOpacity", opacity);
      } else if (allNotes[i].dataset.note === noteName) {
        allNotes[i].style.setProperty("--noteDotOpacity", opacity);
      }
    }
  }

  setNotesToShow(event) {
    let noteToShow = event.target.innerText;
    this.toggleSameNotes(noteToShow, 1);
  }

  setNotesToHide(event) {
    let noteToHide = event.target.innerText;
    this.toggleSameNotes(noteToHide, 0);
  }

  toggleNoteDotFactory(string, fret, opacity) {
    return (event) => {
      // Check if show all notes is selected
      if (string >= numberOfStrings - 2) {
        this.toggleScaleNotes(fret, opacity);
      } else {
        event.target.style.setProperty("--noteDotOpacity", opacity);
      }
    };
  }

  toggleScaleNotes(fret, opacity) {
    let scale = scales[selectedScale];
    let scaleNotes = scale.map((note) => {
      return this.generateNoteNames(note);
    });

    for (let s = numberOfStrings - 1; s >= 0; s--) {
      for (let f = 0; f <= numberOfFrets; f++) {
        if (
          scaleNotes.indexOf(noteFretsArray[s][f].dataset.note) !== -1 &&
          Math.abs(fret - f) <= 3
        ) {
          noteFretsArray[s][f].style.setProperty("--noteDotOpacity", opacity);
        }
      }
    }
  }

  setupNoteNameSection() {
    noteNameSection.innerHTML = "";
    let noteNames;
    noteNames = notes[accidentals];
    noteNameSection.appendChild(tools.createElement("span", "*"));
    noteNames.forEach((noteName) => {
      let noteNameElement = tools.createElement("span", noteName);
      noteNameSection.appendChild(noteNameElement);
    });
  }

  setupEventListeners() {
    instrumentSelector.addEventListener(
      "change",
      this.setSelectedInstrument.bind(this)
    );

    accidentalSelector.addEventListener(
      "click",
      this.setAccidentals.bind(this)
    );
    scaleSelector.addEventListener("change", this.setscaleSelector.bind(this));
    numberOfFretsSelector.addEventListener(
      "change",
      this.setNumberOfFrets.bind(this)
    );

    noteNameSection.addEventListener(
      "mouseover",
      this.setNotesToShow.bind(this)
    );
    noteNameSection.addEventListener(
      "mouseout",
      this.setNotesToHide.bind(this)
    );
  }
}

const tools = {
  createElement(element, content) {
    element = document.createElement(element);
    if (arguments.length > 1) {
      element.innerHTML = content;
    }
    return element;
  },
};

const app = new APP();
