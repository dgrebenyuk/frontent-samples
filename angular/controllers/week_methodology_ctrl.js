angular.module("FeedMG").controller("WeekMethodologyCtrl", [
  "$scope", "$filter", "$state", "$stateParams", "$location", "$http", function($scope, $filter, $state, $stateParams, $location, $http) {

    $scope.options = [];
    $scope.params = {};
    $scope.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.dates = [];

    startDate = ''
    endDate = ''

    $scope.dateOptions = function() {
      var opts = {
        dateFormat: "yy-mm-dd",
        firstDay: 1,
        showOn: 'button',
        buttonImage: "/images/calender.png",
        buttonImageOnly: true
      };
      opts.onSelect = function(d) {
        var date = new Date();
	      date.setTime(Date.parse(d));
        var day = date.getUTCDay() == 0 ? 7 : date.getUTCDay(); // Sunday should be 7th day not 0
        startDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - day + 1);
        endDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - day + 7);
        $scope.params.period = startDate.format('{MM}/{dd}/{yyyy}') + " to "+ endDate.format('{MM}/{dd}/{yyyy}');
      };
      return opts;
    }

    $scope.isNotFilled = function() {
      return !$scope.isFilled();
    };

    $scope.isFilled = function() {
      return $scope.params && $scope.params.period;
    };

    $scope.totalInGroup = function(items) {
      return Object.values(items).flatten().sum();
    };

    $scope.percentage = function(part, total) {
      return part/total;
    };

    $scope.buildReport = function() {
      $scope.ajaxProcessing = true;
      return $http({
        url: '/reports/week_methodology.json',
        method: 'GET',
        params: {
          filter: $scope.params
        }
      }).success(function(data, status, headers, config) {
        $scope.dates = Date.range(startDate, endDate).every('day');
        $scope.data = data;
        $scope.ajaxProcessing = false;
      }).error(function(data, status, headers, config) {
        $scope.ajaxProcessing = false;
        return console.log('something went wrong');
      });
    };

    $('body').on('mousemove', '.ui-datepicker-calendar tr', function() { $(this).find('td a').addClass('ui-state-hover'); });
    $('body').on('mouseleave', '.ui-datepicker-calendar tr', function() { $(this).find('td a').removeClass('ui-state-hover'); });

  }
]);
