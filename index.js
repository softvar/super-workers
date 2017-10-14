$(document).ready(function () {
    hljs.initHighlighting();

    function unhighlightAllNavBarLinks() {
        $('.top-nav-link').removeClass('is-active  active');
        $('.features-nav-link').removeClass('is-active  active');
        $('.installation-nav-link').removeClass('is-active  active');
        $('.flow-diagram-nav-link').removeClass('is-active  active');
        $('.docs-nav-link').removeClass('is-active  active');
        $('.usage-nav-link').removeClass('is-active  active');
        $('.live-demo-nav-link').removeClass('is-active  active');
    }

    function onScroll() {
        var topOffset = $(this).scrollTop(),
            viewportHeight = document.documentElement.clientHeight;

        topOffset += 65; // fixed topbar

        // showing scroll to top logic
        if ($(this).scrollTop() > 100) {
            $('#scrollUp').fadeIn();
        } else {
            $('#scrollUp').fadeOut();
        }

        // nav bar activation logic
        unhighlightAllNavBarLinks();
        if (topOffset <= 1 * viewportHeight) {
            $('.top-nav-link').addClass('is-active  active');
        } else if (topOffset > 1 * viewportHeight && topOffset < 2 * viewportHeight) {
            $('.features-nav-link').addClass('is-active  active');
        } else if (topOffset > 2 * viewportHeight && topOffset < 3 * viewportHeight) {
            $('.installation-nav-link').addClass('is-active  active');
        } else if (topOffset > 3 * viewportHeight && topOffset < 5 * viewportHeight) {
            $('.flow-diagram-nav-link').addClass('is-active  active');
        } else if (topOffset > 5 * viewportHeight && topOffset < 8.5 * viewportHeight) {
            $('.docs-nav-link').addClass('is-active  active');
        } else if (topOffset > 8.5 * viewportHeight && topOffset < 10.5 * viewportHeight) {
            $('.usage-nav-link').addClass('is-active  active');
        } else if (topOffset > 10.5 * viewportHeight && topOffset < 14 * viewportHeight) {
            $('.live-demo-nav-link').addClass('is-active  active');
        } else {
            unhighlightAllNavBarLinks()
        }
    }

    if (!window.location.hash) {
        $('html, body').animate({
            scrollTop: 0
        }, 0);
    }

    $(document).on('click', 'a.animate--scroll', function(event){
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $( $.attr(this, 'href') ).offset().top - 20
        }, 500);
    });

    $(document).on('click', '.fragment-id, .mdl-navigation__link', function (event) {
        window.location.hash = event.currentTarget.hash;
    });

    $(window).on('scroll', function () {
        onScroll();
    });

    $('#scrollUp').click(function () {
        $('html, body').animate({
            scrollTop: 0
        }, 600);
        return false;
    });

    $('.mdl-layout__drawer-button').click(function () {
        $('.mdl-layout__obfuscator').addClass('is-visible');
        $('.mdl-layout__drawer').addClass('is-visible');
    });

    $('.mdl-layout__obfuscator').click(function () {
        $(this).removeClass('is-visible');
        $('.mdl-layout__drawer').removeClass('is-visible');
    });

    // Call onScroll on init too to highlight the appropriate navlink
    onScroll();
});


function fibonacci(n, isFailed) {
    var p = SuperWorkers.Promise.defer();
    if (isFailed) {
        p.reject();
        return p.promise;
    }

    return n < 1 ? 0
        : n <= 2 ? 1
        : fibonacci(n - 1) + fibonacci(n - 2);

}

// off-load a method
function add(a, b, timeout, isFailed) {
    var p = SuperWorkers.Promise.defer();

    // p.promise.timeout(1000)
    setTimeout(function () {
        if (isFailed) {
            return p.reject();
        }
        return p.resolve(a + b);
    }, timeout || 3000);

    // p.promise.cancel();
    return p.promise;
};

window.fullpage = new Vue({
    el: '#live-demo',
    data: {
        minWorkers: 1,
        maxWorkers: 3,
        isConfigSet: false,
        workers: [],
        activeWorkers: [],
        idleWorkers: [],
        terminatedWorkers: [],
        tasks: [],
        activeTasks: [],
        allTasks: [],
        uiTasks: [{
            customId: 1,
            label: 'Fibonacci(25)',
            name: 'Fibonacci(25)',
            priority: 'LOW',
            method: fibonacci,
            params: [25],
            output: 75025,
            className: ''
        }, {
            customId: 2,
            label: 'Fibonacci(28)',
            name: 'Fibonacci(28)',
            priority: 'MEDIUM',
            method: fibonacci,
            params: [28],
            output: 317811,
            className: 'margin-left--20'
        }, {
            customId: 3,
            label: 'Wait(8sec)::Add(10, 20)',
            name: 'Long addition',
            priority: 'HIGH',
            method: add,
            params: [10, 20, 8000],
            output: 30,
            className: 'margin-left--20'
        }, {
            customId: 4,
            label: 'Wait(2sec)::GET_FAILED',
            name: 'Failed task',
            priority: 'LOW',
            method: add,
            params: [10, 20, 2000, true],
            output: 'FAILED',
            className: 'margin-left--20'
        }, {
            customId: 5,
            label: 'Wait(3sec)::Add(10, 20)',
            name: 'Medium addition',
            priority: 'MEDIUM',
            method: add,
            params: [10, 20],
            output: 30,
            className: 'margin-left--20'
        }],
        uiTaskQueue: []
    },
    watch: {
        minWorkers: function () {
            this.updateConfig();
        },
        maxWorkers: function () {
            this.updateConfig();
        }
    },
    methods: {
        updateConfig: function () {
            this.minWorkers = parseInt(this.minWorkers, 10) || '';
            this.maxWorkers = parseInt(this.maxWorkers, 10) || '';

            if (this.minWorkers !== '' && typeof this.minWorkers !== 'number') {
                alert('Please enter a valid minWorkers number');
                this.isConfigSet = false;
                return;
            }

            if (this.maxWorkers !== '' && typeof this.maxWorkers !== 'number') {
                alert('Please enter a valid maxWorkers number');
                this.isConfigSet = false;
                return;
            }

            // Cap wrong values
            this.minWorkers = Math.min(this.minWorkers, this.maxWorkers);

            this.main = new SuperWorkers.MainThread({
                url: 'js/my-worker.js',
                maxWorkers: this.maxWorkers, // hardwareConcurrency
                minWorkers: this.minWorkers,
                killWorkersAfterJob: true
            });

            this.uiTaskQueue = [];
            this.allTasks = [];
            this.isConfigSet = true;
        },
        onTaskButtonClick: function (task) {
            this.uiTaskQueue.push(task);

            this.executeTask(task);
        },
        updateWorkersInfo: function () {
            if (!this.main) { return; }

            var self = this;

            self.workers = self.main.getAllWorkers();
            self.activeWorkers = self.main.getActiveWorkers();
            self.idleWorkers = self.main.getIdleWorkers();
            self.terminatedWorkers = self.main.getTerminatedWorkers();
            self.activeTasks = self.main.taskQueue.getActive();
            self.allTasks = self.main.taskQueue.allTasks;
            // To give a QUEUE feel
            self.allTasks = self.allTasks.slice().reverse();
            // update mdl elements manually since it doesn't work with dynamic elements
            if (componentHandler) {
                componentHandler.upgradeDom();
            }
        },
        executeTask: function (task) {
            var self = this;
            self.main.exec(task.method, task.params, {
                priority: task.priority,
                name: task.name
            }).then(function (val) {
                // console.log(val);
                self.updateWorkersInfo();
            }).catch(function (err) {
                // console.log(err);
                self.updateWorkersInfo();
            });
        },
        init: function () {
            var self = this;
            self.updateConfig();

            // hack to update mdl and other elements in UI
            setInterval(function () {
                self.updateWorkersInfo();
            }, 500);
        }
    }
});

window.fullpage.init();

// console.log(window.main.taskQueue.getNextTask());