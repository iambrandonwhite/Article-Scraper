$(document).ready(function() {
    // Initiate with global scope to be accesible by different click handlers
    var $id;

    // Save article
    $(".save-btn").on("click", function() {
        event.preventDefault();
        $.ajax({
          method: "PUT",
          url: "/save/" + $(this).attr("data-id")
        }).then(function(response) {
          console.log(response);
          window.location = "/"
        });
    });

    // Delete saved article
    $(".delete-btn").on("click", function() {
        event.preventDefault();
        $.ajax({
            method: "DELETE",
            url: "/delete/" + $(this).attr("data-id")
        }).then(function(response) {
            console.log(response);
            window.location = "/saved"
        });
    });

    // Displays notes modal and gets saved notes
    $(".note-btn").on("click", function() {
        $("#note-modal").modal("show");
        $id = $(this).data("id");

        // Clear old notes and id
        $("#display-notes").empty();
        $(".modal-title").text("");

        // Populate notes
        $.ajax({
            method: "GET",
            url: "/notes/" + $id
        }).then(function(response) {
            console.log(response);
            var $p = $("<p>");
            var $div = $("<div>");
            if (!response.notes.length) {
                $p.text("No notes!");
                $("#display-notes").append($p);
            } else {
                for (var i = 0; i < response.notes.length; i++) {
                    var $p = $("<p>");
                    var $btn = $("<button>");
                    $btn.text("X").addClass("note-delete-btn").attr("data-id", response.notes[i]._id);
                    $p.text(response.notes[i].note).addClass("note").append($btn);
                    $div.append($p);
                }
                $("#display-notes").append($div);
            }
            $(".modal-title").text(`Note for article ${response._id}`);
        });
    });

    // Save new note
    $(".save-note-btn").on("click", function() {
        var $note = $(".modal textarea")
        .val()
        .trim();
        if (!$note) {
            alert("Please enter a note!");
        } else {
            $.ajax({
            method: "POST",
            url: "/savenote/" + $id,
            data: {
                note: $note
            }
            }).then(function(response) {
            console.log(response);
            $(".modal textarea").val("");
            $id = null;
            $("#note-modal").modal("hide");
            });
        }
    });

    // Delete note
    $(document).on("click", ".note-delete-btn", function() {
        var $id = $(this).data("id");
        $.ajax({
            method: "DELETE",
            url: "/deletenote/" + $id
        }).then(function(response) {
            console.log(response);
            $("#note-modal").modal("hide");
        });
    });
});