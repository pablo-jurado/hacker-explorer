var utils = require('./utils');

describe('utils.js', function() {

  describe('isCountry', function() {
    it('should return true when the type is country', function() {
      const obj = {
        components: {
          _type: "country"
        }
      };
      expect(utils.isCountry(obj)).toEqual(true);
    });

    it('should return false when the type is not a country', function() {
      const obj = {
        components: {
          _type: "city"
        }
      };
      expect(utils.isCountry(obj)).toEqual(false);
    });
  });

  describe('isCity', function() {
    it('should return true when the type equals to city', function() {
      const obj = {
        components: {
          _type: "city"
        }
      };
      expect(utils.isCity(obj)).toEqual(true);
    });

    it('should return false when the type is not a city', function() {
      const obj = {
        components: {
          _type: "country"
        }
      };
      expect(utils.isCity(obj)).toEqual(false);
    });
  });

  describe('getLocationName', function() {
    it('should return the proper city name', function() {
      const obj = {
        components: {
          _type: "city",
          country: null,
          city: "Houston"
        }
      };
      expect(utils.getLocationName(obj)).toEqual("Houston");
    });

    it('should return the proper country name', function() {
      const obj = {
        components: {
          _type: "country",
          country: "Canada",
          city: null
        }
      };
      expect(utils.getLocationName(obj)).toEqual("Canada");
    });

    it('should return unknown when the location is not available', function() {
      const obj = {
        components: {
          _type: null,
          country: null,
          city: null
        }
      };
      expect(utils.getLocationName(obj)).toEqual("Unknown");
    });

  });

});
