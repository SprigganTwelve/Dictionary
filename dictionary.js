var input = document.querySelector("#input-text");
var load = document.querySelector("#load");
var slider = document.querySelector(".slider");
var audio = document.querySelector("audio");
var prev = document.getElementById("prev");
var next = document.getElementById("next");

const urlRoot = "https://api.dictionaryapi.dev/api/v2/entries/en/";

load.addEventListener("click", function () {
  fetch(urlRoot + input.value)
    .then(function (reponse) {
      return reponse.json();
    })

    .then(function (result) {
      var word = getWord(result);
      var phonetic = getPhonetic(result);
      var audioUrl = getAudioUrl(result);
      var meanings = getMeanings(result);

      slider.style.width = `${meanings.length * 100}%`;

      audio.setAttribute("src", audioUrl);
      audio.addEventListener("click", function () {
        playAudio();
      });

      var sliderInnerHtml = "";
      meanings.forEach((meaning) => {
        var sectionHtml = createSectionHtml(word, phonetic, meaning);
        sliderInnerHtml += sectionHtml;
      });
      slider.innerHTML = sliderInnerHtml;

      var sections = document.querySelectorAll("section");
      console.log(sections);

      var index = 0;
      var translateValue = 100 / sections.length;
      next.addEventListener("click", function () {
        index = index < sections.length - 1 ? index + 1 : sections.length - 1;
        slider.style.transform = `translate(${-translateValue * index}%)`;
      });

      prev.addEventListener("click", function () {
        index = index > 0 ? index - 1 : 0;
        slider.style.transform = `translate(${-translateValue * index}%)`;
      });

      console.log(result);
    })
    .catch(() => {
      slider.innerHTML = "Word NOT FOUND";
    });
});

input.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    event.preventDefault();
    load.click();
  }
});

function getWord(result) {
  return result[0].word;
}

function getPhonetic(result) {
  for (element of result) {
    if (element.phonetic) {
      return element.phonetic;
    }
    for (e of element.phonetics) {
      if (e.text) {
        return e.text;
      }
    }
  }
}

function getAudioUrl(result) {
  for (element of result) {
    for (e of element.phonetics) {
      if (e.audio != "") {
        return e.audio;
      }
    }
  }
}

class Meaning {
  constructor() {
    this.definition;
    this.partOfSpeech;
    this.synonyms = [];
    this.example;
  }
}

function getMeanings(result) {
  var meanings = [];
  result.forEach((element) => {
    element.meanings.forEach((item) => {
      item.definitions.forEach((def) => {
        var component = new Meaning();
        component.definition = def.definition;
        component.partOfSpeech = item.partOfSpeech;
        component.example = def.example;
        item.synonyms.map((synonym) => {
          component.synonyms.push(synonym);
        });
        meanings.push(component);
      });
    });
  });

  console.log(meanings);
  return meanings;
}

function createSectionHtml(word, phonetic, meaning) {
  var sectionHtml = `
  <section>
    <div class="word-attributes">
      <h3>${meaning.partOfSpeech} ${phonetic || ""}</h3>
      <button onclick="playAudio()"><span class="material-symbols-outlined"> sound_sampler </span></button>
    </div>
    <h2>${word}</h2>
    ${meaning.synonyms.length === 0 ? "" : `<h2>synonyms : ${meaning.synonyms.join(", ")}</h2>`}
    <p>${meaning.definition}</p>
    ${meaning.example ? `<p>${meaning.example}</p>` : ""}
  </section>`;
  return sectionHtml;
}

function playAudio() {
  audio.play();
}
