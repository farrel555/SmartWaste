import HomePresenter from '../pages/presenters/home-presenter.js';
import DetailStoryPresenter from '../pages/presenters/detail-story-presenter.js';
import AddStoryPresenter from '../pages/presenters/add-story-presenter.js';
import LoginPresenter from '../pages/presenters/login-presenter.js';
import RegisterPresenter from '../pages/presenters/register-presenter.js';
import OfflineStoryPresenter from '../pages/presenters/offline-story-presenter.js';

const routes = {
  '/': HomePresenter,
  '/story/:id': DetailStoryPresenter,
  '/add': AddStoryPresenter,
  '/login': LoginPresenter,
  '/register': RegisterPresenter,
  '/offline': OfflineStoryPresenter,
};

export default routes;
