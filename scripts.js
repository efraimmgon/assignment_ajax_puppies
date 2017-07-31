// ------------------------------------------------------------------------
// Handlers
// ------------------------------------------------------------------------

var handlers = (() => {

  var getPuppies = (callback) => {
    $.ajax({
      method: "GET",
      url: "https://ajax-puppies.herokuapp.com/puppies.json",
      dataType: "json",
      success: (resp) => callback(resp)
    });
  };

  var getBreeds = (callback) => {
    $.ajax({
      method: "GET",
      url: "https://ajax-puppies.herokuapp.com/breeds.json",
      dataType: "json",
      success: resp => callback(resp)
    });
  };

  // `data` is composed of a `name` and `breed_id`
  var createPuppy = (options) => {
    $.ajax({
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      url: "https://ajax-puppies.herokuapp.com/puppies.json",
      data: options.data,
      success: options.success,
      error: options.error
    });
  };

  var adoptPuppy = (options) => {
    $.ajax({
      method: "DELETE",
      dataType: "json",
      contentType: "application/json",
      url: `https://ajax-puppies.herokuapp.com/puppies/${options.id}.json`,
      success: options.success,
      error: options.error
    });
  };

  return {
    getPuppies: getPuppies,
    getBreeds: getBreeds,
    createPuppy: createPuppy,
    adoptPuppy: adoptPuppy
  };

})();

// ------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------

var views = ((handlers) => {

  var removeAlert = () => $("#puppy-alert").remove();

  var alertFeedback = () => {
    var $elt = $("#puppy-alert");
    if ($elt.length) { $elt.remove(); }

    $elt = $("<div></div>")
      .attr("id", "puppy-alert")
      .addClass(`alert text-center`);
    $(".container").before($elt);
    return $elt;
  }

  var alertSuccess = (msg) => {
    alertFeedback()
      .html(msg)
      .addClass("alert-success")
      .fadeOut(2000);
  };

  var alertError = (msg) => {
    alertFeedback()
      .html(msg)
      .addClass("alert-danger")
      .fadeOut(2000);
  };

  var alertWarning = (msg) => {
    alertFeedback()
      .html(msg)
      .addClass("alert-warning");
  };

  var puppyHTML = puppy => {
    var name = `<strong>${puppy.name}</strong>`;
    var breed = `(${puppy.breed.name})`;
    var created_at = (new Date(puppy.created_at)).toDateString();
    var adopt = $("<a></a>")
      .data("id", puppy.id)
      .addClass("adopt btn btn-link")
      .html(" adopt");
    var $puppy = $("<li></li>")
      .html(`${name} ${breed}, created on ${created_at} --`)
      .append(adopt);
    return $puppy;
  };

  var renderBreedOptions = () => {
    handlers.getBreeds((breeds) => {
      var $elt = $("#breeds");
      $.each(breeds, (i, breed) => {
        var $breed = $("<option></option")
          .attr("value", breed.id)
          .html(breed.name);
        $elt.append($breed);
      });
    });
  };

  var renderPuppies = () => {
    alertWarning("Waiting...");
    handlers.getPuppies((puppies) => {
      var $elt = $("#puppies");
      $elt.html("");
      $.each(puppies, (i, puppy) => {
        $elt.append($(puppyHTML(puppy)));
      });
      removeAlert();
    });
  };

  var addPuppy = (puppy) => {
    $("#puppies").prepend(puppyHTML(puppy));
  };

  var adoptPuppy = (e) => {
    alertWarning("Waiting...");
    e.preventDefault();
    var $this = $(e.target);
    handlers.adoptPuppy({
      id: $this.data().id,
      success: () => {
        $this.parent().remove();
        alertSuccess("Puppy adopted successfully.");
      }
    });
  };


  return {
    renderPuppies: renderPuppies,
    renderBreedOptions: renderBreedOptions,
    alertSuccess: alertSuccess,
    alertError: alertError,
    alertWarning: alertWarning,
    addPuppy: addPuppy,
    adoptPuppy: adoptPuppy
  };
})(handlers);

// ------------------------------------------------------------------------
// Events
// ------------------------------------------------------------------------

var events = ((views) => {

  var onClickAdopt = () => {
    $("#puppies").on("click", ".adopt", views.adoptPuppy);
  };

  var onClickRefreshPuppies = () => {
    $("#refresh-puppies").on("click", views.renderPuppies);
  };

  var onSubmitCreatePuppy = () => {
    $("form").on("submit", (e) => {
      e.preventDefault();
      var [name, breed] = $(e.target).serializeArray();

      handlers.createPuppy({
        data: JSON.stringify({name: name.value, breed_id: breed.value}),
        success: (resp) => {
          views.alertSuccess("Puppy created successfully.");
          views.addPuppy({
            name: resp.name,
            breed: {name: $(`option[value="${resp.breed_id}"]`).html()},
            created_at: (new Date(resp.created_at)).toDateString()
          });
        },
        error: (jqXHR, textStatus, errorThrown) => {
          views.alertError("Failed to create puppy: " + errorThrown);
        }
      });
    });
  };

  return {
    onClickAdopt: onClickAdopt,
    onClickRefreshPuppies: onClickRefreshPuppies,
    onSubmitCreatePuppy: onSubmitCreatePuppy
  };

})(views);

$(document).ready(() => {
  // on page load:
  views.renderBreedOptions();
  views.renderPuppies();

  // events
  events.onClickAdopt();

  events.onClickRefreshPuppies();

  events.onSubmitCreatePuppy();
});
