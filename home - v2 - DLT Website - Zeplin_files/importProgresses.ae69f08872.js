/* eslint-disable strict */

(function () {
    "use strict";

    if (typeof process === "undefined") {
        return;
    }

    var electron = require("electron");
    var ipcRenderer = electron.ipcRenderer,
        hasWebviewsFeature = !!electron && !!electron.features && !!electron.features.webviews,
        hasFigmaFeature = !!electron && !!electron.features && !!electron.features.figma;

    var IMPORT_DONE_CLASSES_CACHE = {};

    var IMPORT_PROGRESS_CLEAR_DURATION = 200,
        IMPORT_PROGRESSES_RESIZE_DELAY = 150,
        IMPORTS_PROGRESS_RADIAL = 15,
        IMPORTS_PROGRESS_BAR_CIRCUMFERENCE = 2 * IMPORTS_PROGRESS_RADIAL * Math.PI,
        IMPORT_PROGRESS_HEIGHT = 74,
        IMPORT_PROGRESS_CLEAR_INCREMENTAL_DELAY = 80,
        SUBSCRIBE_TO_IMPORTS_CHANNEL = hasFigmaFeature ? "subscribe-to-imports" : "subscribe-to-exports",
        IMPORTS_CHANGE_CHANNEL = hasFigmaFeature ? "imports-change" : "exports-change",
        IMPORTS_STARTED_CHANNEL = hasFigmaFeature ? "imports-started" : "exports-started",
        CLEAR_IMPORTS_CHANNEL = hasFigmaFeature ? "clear-imports" : "clear-exports",
        RETRY_IMPORT_CHANNEL = hasFigmaFeature ? "retry-import" : "retry-export",
        CANCEL_IMPORT_CHANNEL = hasFigmaFeature ? "cancel-import" : "cancel-export",
        RETRY_GETTING_PROJECT_CHANNEL = "retry-getting-project";

    var importProgresses = document.getElementById("importProgresses"),
        importProgressTemplate = document.getElementById("importProgressTemplate"),
        importProgressProjectGroupTemplate = document.getElementById("importProgressProjectGroupTemplate"),
        importDestination = document.getElementById("importDestination"),
        importProgressesButton = document.getElementById("importProgressesButton"),
        importProgressesContainer = document.getElementById("importProgressesContainer"),
        clearImportProgresses = document.getElementById("clearImportProgresses"),
        importsProgressBar = document.getElementById("importsProgressBar"),
        notificationContainer = document.getElementById("notificationContainer"),
        userMenu = document.getElementById("userMenu");

    function isImpportGettingProject(progress) {
        return progress.isGettingProject && !progress.isGettingProjectFailed;
    }

    function isImportFailedAtGettingProject(progress) {
        return progress.isGettingProject && progress.isGettingProjectFailed;
    }

    function isImportDone(progress) {
        return progress.countOfUploadedImages === progress.countOfImagesToUpload &&
            progress.isApiOperationCompleted && !progress.isApiOperationFailed;
    }

    function isImportFailed(progress) {
        return progress.isApiOperationFailed;
    }

    function isImportTicklingTheBackend(progress) {
        return progress.countOfUploadedImages === progress.countOfImagesToUpload &&
            !progress.isApiOperationCompleted;
    }

    function isImportUploadingImages(progress) {
        return progress.countOfUploadedImages < progress.countOfImagesToUpload &&
            !progress.isApiOperationCompleted;
    }

    function retryImport(screenImportId) {
        ipcRenderer.send(RETRY_IMPORT_CHANNEL, screenImportId);
    }

    function cancelImport(screenImportId) {
        ipcRenderer.send(CANCEL_IMPORT_CHANNEL, screenImportId);
    }

    function retryGettingProject(screenImportId) {
        ipcRenderer.send(RETRY_GETTING_PROJECT_CHANNEL, screenImportId);
    }

    function calculateProgress(screenImport) {
        if (screenImport.progress.isApiOperationCompleted) {
            return 100;
        }
        return Math.floor(
            (screenImport.progress.countOfUploadedImages / (screenImport.progress.countOfImagesToUpload + 1)) * 100
        );
    }

    function importDoneMessage() {
        var seed = Math.floor(Math.random() * 100);
        switch (seed) {
            case 0:
                return "message1";
            case 1:
            case 2:
                return "message2";
            case 3:
            case 4:
                return "message3";
            default:
                return "message4";
        }
    }

    function goToScreen(pid, sid) {
        hideImportProgressesContainer();
        location.assign("/project/" + pid + "/screen/" + sid);
    }

    function handleImportProgressesClick(ev) {
        ev.stopPropagation();
        var importProgress = ev.target.closest(".importProgress");
        if (importProgress) {
            if (importProgress.classList.contains("importProgressDone")) {
                goToScreen(importProgress.dataset.projectId, importProgress.dataset.screenId);
            } else if (ev.target.classList.contains("retryImport")) {
                retryImport(ev.target.parentElement.dataset.screenImportId);
            } else if (ev.target.classList.contains("cancelImport")) {
                cancelImport(ev.target.parentElement.dataset.screenImportId);
            } else if (ev.target.classList.contains("retryFetchProject")) {
                retryGettingProject(ev.target.parentElement.parentElement.dataset.screenImportId);
            }
        }
    }

    function addImportProgress(container) {
        return function (screenImport) {
            var newImportProgress = document.importNode(importProgressTemplate.content, true);
            var importProgressDiv = newImportProgress.querySelector(".importProgress");

            importProgressDiv.dataset.screenImportId = screenImport._id;

            if (isImpportGettingProject(screenImport.progress)) {
                importProgressDiv.classList.add("gettingProject");
            } else if (isImportFailedAtGettingProject(screenImport.progress)) {
                importProgressDiv.classList.add("gettingProjectFailed");
            } else {
                importProgressDiv.dataset.projectId = screenImport.project._id;
                importProgressDiv.dataset.screenId = screenImport.screen._id;

                if (screenImport.progress.update) {
                    importProgressDiv.classList.add("updateScreen");
                } else {
                    importProgressDiv.classList.add("newScreen");
                }
                newImportProgress.querySelector(".screenName").textContent = screenImport.screen.name;

                if (screenImport.progress.isApiOperationFailed) {
                    newImportProgress.querySelector(".importProgressBar").style.width = "0%";
                } else {
                    newImportProgress.querySelector(".importProgressBar").style.width = calculateProgress(screenImport) + "%";
                }

                if (isImportDone(screenImport.progress)) {
                    if (!IMPORT_DONE_CLASSES_CACHE[screenImport._id]) {
                        IMPORT_DONE_CLASSES_CACHE[screenImport._id] = importDoneMessage();
                    }
                    importProgressDiv.classList.add(IMPORT_DONE_CLASSES_CACHE[screenImport._id]);
                    importProgressDiv.classList.add("importProgressDone");
                } else if (isImportFailed(screenImport.progress)) {
                    importProgressDiv.classList.add("importProgressFailed");
                    if (screenImport.progress.apiOperationFailedError && screenImport.progress.apiOperationFailedError.title) {
                        importProgressDiv.querySelector(".failed").textContent = screenImport.progress.apiOperationFailedError.title;
                        if (screenImport.progress.apiOperationFailedError.message) {
                            importProgressDiv.querySelector(".failed").title = screenImport.progress.apiOperationFailedError.message;
                        }
                    }
                } else if (isImportTicklingTheBackend(screenImport.progress)) {
                    importProgressDiv.classList.add("ticklingTheBackendStep");
                } else if (isImportUploadingImages(screenImport.progress)) {
                    importProgressDiv.classList.add("uploadingImagesStep");
                    newImportProgress.querySelector(".uploadedImages").textContent = screenImport.progress.countOfUploadedImages;
                    newImportProgress.querySelector(".allImages").textContent = screenImport.progress.countOfImagesToUpload;
                }
            }

            if (container) {
                container.appendChild(newImportProgress);
            } else {
                document.querySelector('.importProgressProjectGroup[data-pid="' + screenImport.project._id + '"] .importProgressesOfProject').appendChild(newImportProgress);
            }
        };
    }

    function addProject(project) {
        var newProject = document.importNode(importProgressProjectGroupTemplate.content, true);

        newProject.querySelector(".projectInformation").textContent = project.name + ", " + project.type;
        newProject.querySelector(".importProgressProjectGroup").dataset.pid = project._id;

        importProgresses.appendChild(newProject);
    }

    function handleImportsChange(event, imports) {
        if (imports.length === 0) {
            importProgressesButton.classList.add("hidden");
            importProgressesContainer.classList.add("hidden");
            return;
        }

        importProgresses.style.height = "auto";
        importProgressesButton.classList.remove("hidden");
        importProgresses.innerHTML = "";

        var importInformation = imports.reduce(function (acc, screenImport, index) {
            var foundProject = acc.projects.find(function (existingProject) {
                return existingProject._id === screenImport.project._id;
            });

            return {
                projects: foundProject ? acc.projects : acc.projects.concat(screenImport.project),
                progress: Math.floor(((acc.progress * index) + calculateProgress(screenImport)) / (index + 1)),
                anyImportFailed: acc.anyImportFailed || !!screenImport.progress.isApiOperationFailed
            };
        }, {
            projects: [],
            progress: 0,
            anyImportFailed: false
        });

        var projects = importInformation.projects;

        var importsProgressPercentage = importInformation.progress;

        importsProgressBar.setAttribute(
            "stroke-dasharray",
            (IMPORTS_PROGRESS_BAR_CIRCUMFERENCE * importsProgressPercentage / 100) + " " +
            (IMPORTS_PROGRESS_BAR_CIRCUMFERENCE * (100 - importsProgressPercentage) / 100)
        );

        importProgressesButton.classList.toggle("importsDone", importsProgressPercentage >= 100);
        importProgressesButton.classList.toggle("importsFailed", importInformation.anyImportFailed);

        if (projects.length === 1) {
            importDestination.textContent = projects[0].name;
            imports.forEach(addImportProgress(importProgresses));
        } else {
            importDestination.textContent = "Zeplin";
            projects.forEach(addProject);
            imports.forEach(addImportProgress());
        }
    }

    function unsubscribeFromImportsChange() {
        ipcRenderer.removeAllListeners(IMPORTS_CHANGE_CHANNEL);
    }

    function subscribeToImportsChange() {
        ipcRenderer.on(IMPORTS_CHANGE_CHANNEL, handleImportsChange);
        ipcRenderer.send(SUBSCRIBE_TO_IMPORTS_CHANNEL);
    }

    function hideImportProgressesContainer() {
        importProgressesContainer.classList.add("hidden");
    }

    ipcRenderer.on(IMPORTS_STARTED_CHANNEL, function () {
        notificationContainer.classList.add("hidden");
        userMenu.classList.add("hidden");
        importProgressesButton.classList.remove("hidden");
        if (hasWebviewsFeature) {
            ipcRenderer.once("active", function (ev, active) {
                importProgressesContainer.classList.toggle("hidden", !active);
            });
            ipcRenderer.sendToHost("active");
        } else {
            importProgressesContainer.classList.remove("hidden");
        }
    });

    importProgressesContainer.addEventListener("click", handleImportProgressesClick);

    importProgressesButton.addEventListener("click", function (ev) {
        ev.stopPropagation();
        notificationContainer.classList.add("hidden");
        userMenu.classList.add("hidden");
        importProgressesContainer.classList.toggle("hidden");
    });

    importProgresses.addEventListener("transitionend", function (ev) {
        if (ev.target.id === importProgresses.id && ev.propertyName === "height") {
            var allImportProgresses = importProgresses.querySelectorAll(".importProgress");
            var doneImportProgresses = importProgressesContainer.querySelectorAll(".importProgress.importProgressDone, " +
                ".importProgress.importProgressFailed");
            if (allImportProgresses.length === doneImportProgresses.length) {
                importProgressesContainer.classList.add("hidden");
            }
            subscribeToImportsChange();
        }
    });

    clearImportProgresses.addEventListener("click", function (ev) {
        ev.preventDefault();

        var doneImportProgresses = importProgressesContainer.querySelectorAll(".importProgress.importProgressDone, " +
            ".importProgress.importProgressFailed");
        if (doneImportProgresses.length > 0) {
            unsubscribeFromImportsChange();
        }

        var delay = 0;

        function removeProgressFromDOM(event) {
            if (event.propertyName === "height") {
                event.target.remove();
            }
        }

        importProgresses.style.height = importProgresses.clientHeight + "px";

        for (var i = doneImportProgresses.length - 1; i > -1; i--) {
            var doneImportProgress = doneImportProgresses[i];
            doneImportProgress.addEventListener("transitionend", removeProgressFromDOM);
            doneImportProgress.style.transitionDelay = delay + "ms";
            doneImportProgress.classList.add("clearImportProgress");
            delay += IMPORT_PROGRESS_CLEAR_INCREMENTAL_DELAY;
        }

        var finalDelay = delay - IMPORT_PROGRESS_CLEAR_INCREMENTAL_DELAY;

        importProgresses.style.transitionDuration = (finalDelay +
            IMPORT_PROGRESS_CLEAR_DURATION + IMPORT_PROGRESSES_RESIZE_DELAY) + "ms";
        importProgresses.style.height = (importProgresses.clientHeight -
            (doneImportProgresses.length * IMPORT_PROGRESS_HEIGHT)) + "px";

        ipcRenderer.send(CLEAR_IMPORTS_CHANNEL);
    });

    document.addEventListener("click", function (ev) {
        if (ev.button === Zeplin.MOUSE_BUTTON.LEFT) {
            hideImportProgressesContainer();
        }
    });

    document.addEventListener("keydown", function (ev) {
        if (ev.keyCode === Zeplin.KEY_CODE.ESC) {
            hideImportProgressesContainer();
        }
    });

    subscribeToImportsChange();

    Array.from(document.querySelectorAll("#importProgressesButton circle")).forEach(function (c) {
        c.setAttribute("r", IMPORTS_PROGRESS_RADIAL);
    });
    importsProgressBar.setAttribute("stroke-dasharray", "0 " + IMPORTS_PROGRESS_BAR_CIRCUMFERENCE);

    window.ImportProgresses = {
        hideImportProgressesContainer: hideImportProgressesContainer
    };
}());
