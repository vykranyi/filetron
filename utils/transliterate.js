const cyrillicToLatinMap = {
  А: "A", Б: "B", В: "V", Г: "H", Ґ: "G", Д: "D", Е: "E", Є: "Ye", Ж: "Zh", З: "Z",
  И: "Y", І: "I", Ї: "Yi", Й: "Y", К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P",
  Р: "R", С: "S", Т: "T", У: "U", Ф: "F", Х: "Kh", Ц: "Ts", Ч: "Ch", Ш: "Sh",
  Щ: "Shch", Ю: "Yu", Я: "Ya", Ь: "", Ъ: "", 
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh", з: "z",
  и: "y", і: "i", ї: "yi", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ю: "yu", я: "ya", ь: "", ъ: ""
};

function transliterate(text) {
  return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
}

module.exports = { transliterate };
