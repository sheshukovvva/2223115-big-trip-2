import Observable from '../framework/observable.js';

export default class OffersModel extends Observable{
  constructor(offersApiService) {
    super();
    this._offersApiService = offersApiService;
    this._offers = []
  }

  init = async () => {
    try {
      this._offers = await this._offersApiService.offers;
    } catch(err) {
      this._offers = [];
    }
  };

  get offers() {
    return this._offers;
  }
}