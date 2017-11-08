const gulp = require("gulp");
const apidoc = require("gulp-apidoc");
//Need to create the src folder and move server.js into there.
gulp.task("apidoc", (done) => {
    apidoc({
        src: "TempFolderDoc/",
        dest: "docs/apidoc",
        options: {
            excludeFilters: [ "node_modules" ]
        }
    }, done);
});
