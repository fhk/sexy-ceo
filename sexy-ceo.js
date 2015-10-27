Ceos = new Mongo.Collection("ceos");

Router.map(function() {
    this.route('home', {path: '/'});
    this.route('ceo_view', {
        path: '/file/:slug',
        data: function () {
            console.log("looking for ceo: " + this.params.slug);
            h = Ceos.findOne({ ceo: this.params.slug });
            console.log(h);
            if (h) {
                // for some reason {{ceo}} was undefined in the template.
                h["file_ceo"] = h["ceo"];
                return h;
            }
        }
    });
})

if (Meteor.isClient) {
    Template.leaderboard.ceos = function () {
        return Ceos.find({}, {limit: 20, sort: {votes: -1}});
    };

    function submitCeo (template, vote) {
        url = template.find("input[name=url]")
        first = template.find("input[name=first]")
        last = template.find("input[name=last]")

        submitVote(first.value, last.value, url.value, vote)
    }

    function submitVote(first, last, url, vote) {
        Meteor.call("addCeo", first, last, url, vote, function (error) {
            if (!error) {
                console.log("Added (ceo, vote): "
                    + "(" + url.value + ", " + vote);
                url.value = ""
            } else {
                console.log(error)
                console.log("Didn't add anything.");
            }
        });
    }

    Template.leaderboard.voteForCeo = function (url) {
        submitVote(null, null, url, 1)

    }

    Template.submit_ceo.events({
        'click #sexy' : function(event, template) { submitCeo(template, 1); },
    });
}

if (Meteor.isServer) {
    Meteor.methods({
        addCeo : function (first, last, url, vote) {
            var thing = Ceos.findOne( {"url": url} );
            if (thing) {
                console.log("Updating CEO (votes): " + url + ", ");
                Ceos.update( thing, { $inc: {votes: vote }})
            } else {
                console.log("Adding CEO (votes): (" + url + ", ")
                Ceos.insert({ first:first, last:last, url: url, votes: vote});
            }

            return false;
        },

        // findCeo: function (ceo) {
        //     return Ceos.findOne({ url: url });
        // }
    });

    Meteor.startup(function () {
        if (Ceos.find().count() === 0) {
            // initial Ceos that are sexy.
            var ceos = ["http://thebacklabel.com/wp-content/uploads/2014/05/bill-gates-desk-picture.jpg",
            ];
            for (var i = 0; i < Ceos.length; i++) {
                Ceos.insert({ceo: Ceos[i], votes: 1});
            }
        }
    });
}
