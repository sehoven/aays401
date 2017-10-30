const gulp = require("gulp");
const apidoc = require("gulp-apidoc");

gulp.task("apidoc", (done) => {
    apidoc({
        src: "TempDocFolder/",
        dest: "docs/apidoc",
        options: {
            excludeFilters: [ "node_modules" ]
        }
    }, done);
});
