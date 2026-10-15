"use strict";

/*
 * love-recipebook — page logic.
 *
 * A small cookbook for the two of us: the starter recipes we'd actually make,
 * a "pick for us" button that never repeats the last choice, and room for our
 * own. Everything is stored on this device.
 */

(function () {
  var STORE = "mena-recipes";

  var STARTER = [
    {
      id: "r1",
      title: "Margherita pizza",
      tag: "pizza",
      time: 90,
      cooked: 0,
      custom: false,
      ingredients: [
        "300g strong flour + a pinch of salt",
        "7g dried yeast, 200ml warm water",
        "2 tbsp olive oil",
        "San Marzano tomatoes, a spoon per base",
        "Fresh mozzarella, torn",
        "Basil leaves and a thread of good olive oil"
      ],
      steps: [
        "Knead the dough for 10 minutes until it feels like a sleepy cat.",
        "Cover and let it rise for an hour (it should double).",
        "Stretch it out — no rolling pin, use your knuckles.",
        "Sauce, cheese, a little salt, nothing else.",
        "Hot oven, as hot as it goes, until the crust blisters.",
        "Basil on after, then cut it into six and take the first bite together."
      ]
    },
    {
      id: "r2",
      title: "Masala chai",
      tag: "drinks",
      time: 10,
      cooked: 0,
      custom: false,
      ingredients: [
        "250ml water",
        "250ml milk",
        "2 tsp loose black tea",
        "2 cardamom pods, lightly crushed",
        "A small stick of cinnamon",
        "Ginger, a thin slice",
        "Sugar or honey to taste"
      ],
      steps: [
        "Boil the water with the spices and ginger.",
        "Add the tea, let it go dark for two minutes.",
        "Pour in the milk and bring it back to a soft boil.",
        "Sweeten, strain, and hold the cup with both hands."
      ]
    },
    {
      id: "r3",
      title: "Cacio e pepe",
      tag: "pasta",
      time: 20,
      cooked: 0,
      custom: false,
      ingredients: [
        "200g tonnarelli or spaghetti",
        "50g Pecorino Romano, finely grated",
        "1 tsp black peppercorns, cracked",
        "A ladle of pasta water"
      ],
      steps: [
        "Toast the pepper in a dry pan until it smells like a warm evening.",
        "Cook the pasta in shallow, barely salted water.",
        "Make a cream with the cheese and a splash of the starchy water.",
        "Toss everything off the heat until it's glossy, never clumpy.",
        "Serve immediately, extra pepper on top."
      ]
    },
    {
      id: "r4",
      title: "White-chocolate brownies",
      tag: "sweet",
      time: 35,
      cooked: 0,
      custom: false,
      ingredients: [
        "150g white chocolate",
        "110g butter",
        "150g sugar",
        "2 eggs",
        "100g flour",
        "A pinch of salt"
      ],
      steps: [
        "Melt the chocolate and butter together slowly.",
        "Whisk in the sugar, then the eggs, until it's silky.",
        "Fold in the flour and salt — stop as soon as it disappears.",
        "Bake at 175°C for 22–25 minutes; the middle should still wobble a little.",
        "Cool fully before cutting (the hardest part)."
      ]
    },
    {
      id: "r5",
      title: "Shakshuka",
      tag: "breakfast",
      time: 25,
      cooked: 0,
      custom: false,
      ingredients: [
        "1 onion, sliced",
        "1 red pepper, sliced",
        "2 garlic cloves",
        "1 tsp cumin, 1 tsp paprika",
        "400g chopped tomatoes",
        "4 eggs",
        "Parsley and bread to serve"
      ],
      steps: [
        "Soften the onion and pepper in olive oil, 8 minutes.",
        "Add garlic and spices for a minute so they wake up.",
        "Tip in the tomatoes and simmer until thick.",
        "Make four wells, crack in the eggs, cover.",
        "Cook until the whites are set and the yolks are still soft.",
        "Parsley, bread, and eat straight from the pan."
      ]
    }
  ];

  var state = { recipes: [], lastPick: null };
  var openId = null;

  /* ---------------- storage ---------------- */

  function load() {
    state.recipes = [];
    state.lastPick = null;
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) { raw = null; }
    var s = null;
    if (raw) { try { s = JSON.parse(raw); } catch (e) { s = null; } }
    if (s && Array.isArray(s.recipes) && s.recipes.length) {
      s.recipes.forEach(function (r) {
        if (r && typeof r.id === "string" && typeof r.title === "string") {
          state.recipes.push({
            id: r.id,
            title: r.title.slice(0, 120),
            tag: typeof r.tag === "string" ? r.tag.slice(0, 40) : "",
            time: isFinite(r.time) ? Math.max(1, Math.min(600, Math.round(r.time))) : 30,
            cooked: isFinite(r.cooked) ? Math.max(0, Math.round(r.cooked)) : 0,
            custom: !!r.custom,
            ingredients: Array.isArray(r.ingredients) ? r.ingredients.slice(0, 30).map(String) : [],
            steps: Array.isArray(r.steps) ? r.steps.slice(0, 30).map(String) : []
          });
        }
      });
      if (typeof s.lastPick === "string") state.lastPick = s.lastPick;
    } else {
      state.recipes = STARTER.map(copyStarter);
    }
  }

  function copyStarter(r) {
    return {
      id: r.id,
      title: r.title,
      tag: r.tag,
      time: r.time,
      cooked: r.cooked,
      custom: r.custom,
      ingredients: r.ingredients.slice(),
      steps: r.steps.slice()
    };
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ recipes: state.recipes, lastPick: state.lastPick }));
    } catch (e) { /* ignore */ }
  }

  /* ---------------- helpers ---------------- */

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function note(msg) { setText("save-note", msg); }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function lines(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 0; })
      .slice(0, 30);
  }

  function find(id) {
    for (var i = 0; i < state.recipes.length; i += 1) {
      if (state.recipes[i].id === id) return state.recipes[i];
    }
    return null;
  }

  function nextId() {
    var max = 0;
    state.recipes.forEach(function (r) {
      var n = parseInt(String(r.id).replace(/\D/g, ""), 10);
      if (n > max) max = n;
    });
    return "r" + (max + 1);
  }

  /* ---------------- actions ---------------- */

  function pick() {
    if (!state.recipes.length) { note("The book is empty \u2014 add a recipe first."); return null; }
    var pool = state.recipes.length > 1
      ? state.recipes.filter(function (r) { return r.id !== state.lastPick; })
      : state.recipes.slice();
    if (!pool.length) pool = state.recipes.slice();
    var chosen = pool[Math.floor(Math.random() * pool.length)];
    state.lastPick = chosen.id;
    save();

    var card = document.getElementById("pick-card");
    if (card) card.hidden = false;
    setText("pick-name", chosen.title);
    setText("pick-meta", (chosen.tag ? chosen.tag + " \u00b7 " : "") + chosen.time + " minutes");
    setText("pick-steps", chosen.steps.length ? chosen.steps[0] : "");
    return chosen;
  }

  function addRecipe(title, tag, time, ingredientsText, stepsText) {
    title = String(title || "").trim();
    if (!title) return false;
    var ing = lines(ingredientsText);
    var st = lines(stepsText);
    state.recipes.push({
      id: nextId(),
      title: title.slice(0, 120),
      tag: String(tag || "").trim().slice(0, 40),
      time: Math.max(1, Math.min(600, Number(time) || 30)),
      cooked: 0,
      custom: true,
      ingredients: ing,
      steps: st
    });
    save();
    render();
    return true;
  }

  function cooked(id) {
    var r = find(id);
    if (!r) return false;
    r.cooked += 1;
    save();
    render();
    note("Cooked \u2014 " + r.title + " now made " + r.cooked + " time" + (r.cooked === 1 ? "" : "s") + ".");
    return true;
  }

  function removeRecipe(id) {
    for (var i = 0; i < state.recipes.length; i += 1) {
      if (state.recipes[i].id === id) {
        var title = state.recipes[i].title;
        state.recipes.splice(i, 1);
        if (state.lastPick === id) state.lastPick = null;
        if (openId === id) openId = null;
        save();
        render();
        note("\u201c" + title + "\u201d is out of the book.");
        return true;
      }
    }
    return false;
  }

  function resetBook() {
    state.recipes = STARTER.map(copyStarter);
    state.lastPick = null;
    openId = null;
    save();
    render();
    note("Back to the starter book \u2665");
  }

  /* ---------------- rendering ---------------- */

  function renderCard(r) {
    var card = el("div", "recipe-card");
    card.setAttribute("data-id", r.id);

    var head = el("button", "recipe-head");
    head.type = "button";
    head.appendChild(el("span", "recipe-name")).textContent = r.title;
    if (r.tag) head.appendChild(el("span", "recipe-tag")).textContent = r.tag;
    head.appendChild(el("span", "recipe-time")).textContent = r.time + " min";
    head.appendChild(el("span", "recipe-cooked")).textContent = r.cooked ? "\u00d7" + r.cooked : "";
    head.addEventListener("click", function () {
      openId = openId === r.id ? null : r.id;
      render();
    });
    card.appendChild(head);

    if (openId === r.id) {
      var body = el("div", "recipe-body");

      if (r.ingredients.length) {
        body.appendChild(el("h4")).textContent = "Ingredients";
        var ul = el("ul");
        r.ingredients.forEach(function (i) { ul.appendChild(el("li")).textContent = i; });
        body.appendChild(ul);
      }
      if (r.steps.length) {
        body.appendChild(el("h4")).textContent = "Method";
        var ol = el("ul");
        r.steps.forEach(function (s) { ol.appendChild(el("li")).textContent = s; });
        body.appendChild(ol);
      }

      var tools = el("div", "recipe-tools");

      var cook = el("button", "button button-ghost");
      cook.type = "button";
      cook.textContent = "We made this";
      cook.addEventListener("click", function () { cooked(r.id); });
      tools.appendChild(cook);

      var del = el("button", "button button-ghost");
      del.type = "button";
      del.textContent = "Remove";
      del.addEventListener("click", function () { removeRecipe(r.id); });
      tools.appendChild(del);

      body.appendChild(tools);
      card.appendChild(body);
    }

    return card;
  }

  function render() {
    var list = document.getElementById("recipe-list");
    if (list) {
      list.textContent = "";
      if (!state.recipes.length) {
        var empty = el("p", "recipe-empty");
        empty.textContent = "No recipes yet \u2014 add the first one below.";
        list.appendChild(empty);
      } else {
        state.recipes.forEach(function (r) { list.appendChild(renderCard(r)); });
      }
    }
    setText("recipe-count", state.recipes.length);
  }

  /* ---------------- wiring ---------------- */

  function wire() {
    var pickBtn = document.getElementById("pick-recipe");
    if (pickBtn) pickBtn.addEventListener("click", function () { pick(); });

    var addBtn = document.getElementById("add-recipe");
    if (addBtn) addBtn.addEventListener("click", function () {
      var n = document.getElementById("add-name");
      if (!n || !String(n.value).trim()) {
        note("Give it a name first \u2665");
        return;
      }
      var tag = document.getElementById("add-tag");
      var time = document.getElementById("add-time");
      var ing = document.getElementById("add-ingredients");
      var st = document.getElementById("add-steps");
      addRecipe(n.value, tag ? tag.value : "", time ? time.value : 30, ing ? ing.value : "", st ? st.value : "");
      if (n) n.value = "";
      if (ing) ing.value = "";
      if (st) st.value = "";
      note("Added to the book \u2665");
    });

    var reset = document.getElementById("reset-recipes");
    if (reset) reset.addEventListener("click", resetBook);

    var share = document.getElementById("share-button");
    if (share) share.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { note("Link copied \u2665"); })
          .catch(function () { note(url); });
        return;
      }
      note(url);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    render();
    wire();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  });
})();
