import { by, element, expect, device } from 'detox';

describe('Схематичная карта', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('открывает экран карты и показывает поиск', async () => {
    await expect(element(by.id('search-input'))).toBeVisible();
  });

  it('находит станцию через поиск', async () => {
    await element(by.id('search-input')).tap();
    await element(by.id('search-input')).typeText('Фрязино');
    await expect(element(by.text('Фрязино-Пасс.'))).toBeVisible();
  });

  it('фокусируется на станции и открывает карточку', async () => {
    await element(by.id('search-input')).tap();
    await element(by.id('search-input')).typeText('Мытищи');
    await element(by.text('Мытищи')).atIndex(0).tap();
    await expect(element(by.id('station-sheet'))).toBeVisible();
    await expect(element(by.id('station-title'))).toHaveText('Мытищи');
  });

  it('показывает информацию о доступности', async () => {
    await element(by.id('search-input')).tap();
    await element(by.id('search-input')).typeText('Мытищи');
    await element(by.text('Мытищи')).atIndex(0).tap();
    await element(by.id('station-scroll')).scrollTo('top');
    await expect(element(by.text('Маломобильные пассажиры'))).toBeVisible();
  });

  it('переключает тему', async () => {
    await element(by.id('theme-toggle')).tap();
    await expect(element(by.id('theme-toggle'))).toBeVisible();
  });
});