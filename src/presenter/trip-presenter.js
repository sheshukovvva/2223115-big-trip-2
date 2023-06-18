import { render, remove} from '../framework/render';
import { sortByDay, sortByPrice, sortByTime } from '../utils';
import NewPointView from '../view/new-point';
import SortView from '../view/sort';
import TripListView from '../view/trip-list';
import FirstMessageView from '../view/first-message';
import PointPresenter from './point-presenter';
import { SORTED_TYPE , UserAction, UpdateType} from '../const';

class TripPresenter { 
  constructor(container, pointsModel) {
    this._tripListComponent = new TripListView();
    this._sortComponent = null;
    this._firstNessageComponent = new FirstMessageView();
    this._container = container;
    this._pointsModel = pointsModel;
    this._pointsModel.addObserver(this._handleModelEvent)
    this._pointPresenter = new Map();
    this._currentSortType = SORTED_TYPE.DAY
  }

  get points() {
    switch (this._currentSortType){
      case SORTED_TYPE.PRICE:
        return sortByPrice(this._pointsModel)
      case SORTED_TYPE.TIME:
        return sortByTime([...this._pointsModel.points])
    }

    return sortByDay([...this._pointsModel.points]);
  }

  init() {
    this._renderTrip();
  }

  _handleModeChange = () => {
    this._pointPresenter.forEach((presenter) => presenter.resetView())
  }

  _handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this._pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this._pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this._pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  _handleModelEvent = (updateType, update) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this._pointPresenter.get(update.id).init(update)
        break;
      case UpdateType.MINOR:
        this._clearList()
        this._renderTrip()
        break;
      case UpdateType.MAJOR:
        this._clearList({resetSortType: true})
        this._renderTrip()
        break;
    }
  };

  _renderFirstMessage = () => {
    render(this._firstNessageComponent, this._container);
  }

  _handleSortTypeChange = (sortType) => {
    if (sortType === this._currentSortType){
      return
    }

    this._currentSortType = sortType
    this._clearList()
    this._renderTrip()
  }

  _renderSort = () => {
      this._sortComponent = new SortView(this._currentSortType)
      render(this._sortComponent, this._container);
      this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
  }

  _renderNewPoint = () => {
    render(new NewPointView(this._pointsModel.getOffers(),
      this._pointsModel.getDestination()), this._tripListComponent.element);
  }

  _renderPoints = (points) => {
    points.forEach((point) => this._renderPoint(point))
  }

  _renderPoint(point) {
    const pointPresenter = new PointPresenter(
      this._tripListComponent.element, 
      this._pointsModel,
      this._handleViewAction,
      this._handleModeChange);

    pointPresenter.init(point)
    this._pointPresenter.set(point.id, pointPresenter);
  }

  _renderTrip() {
    if (this.points.length === 0) {
      this._renderFirstMessage()
      return
    }

    this._renderSort()
    render(this._tripListComponent, this._container);
    this._renderPoints(this.points)
  }
  
  _clearList = ({resetSortType = false} = {}) => {
    this._pointPresenter
      .forEach((presenter) => presenter.destroy())
    this._pointPresenter.clear()

    remove(this._sortComponent)
    remove(this._firstNessageComponent)

    if (resetSortType) {
      this._currentSortType = SORTED_TYPE.DAY
    }
  }
}

export default TripPresenter;
