import * as KoaRouter from 'koa-router';
import * as data from './data';
const router = new KoaRouter();

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World!';
  next();
});

router.get('/readings', async (ctx, next) => {
  let meterReadings;
  try {
    meterReadings = await data.getAllMeterReadings();
  } catch (getReadingsError) {
    const readingsError = new Error(`An error occurred at get '/readings': ${getReadingsError.message}`)
    ctx.status = 500;
    ctx.body = readingsError.message;
    ctx.app.emit('error', readingsError, ctx);
    next();
  }

  ctx.status = 200;
  ctx.body = meterReadings;
  next();
});

router.post('/recordmeterreading', async (ctx, next) => {
  const meterReadingToWrite = {
    ...ctx.request.body,
    unit: 'kWh'
  }

  if (meterReadingToWrite) {
    try {
      await data.writeMeterReading(meterReadingToWrite);
      ctx.status = 200;
      next();
    } catch (postReadingError) {
      const writingError =
        new Error(
          `An error occurred at post '/recordmeterreading': ${postReadingError.message}`
        );
      ctx.status = 500;
      ctx.body = postReadingError.message;
      ctx.app.emit('error', postReadingError, ctx);
      next();
    }
  } else {
    const noDataError =
      new Error(
        'Please post a valid meter reading to this endpoint.'
      );
    ctx.status = 500;
    ctx.body = noDataError.message;
    ctx.app.emit('error', noDataError, ctx);
    next();
  }
});

router.get('/estimatedmonthlyusages', async (ctx, next) => {
  let averageMonthlyUsages;
  try {
    averageMonthlyUsages = await data.calculateMonthlyAverageUsage();
  } catch (getReadingsError) {
    const readingsError = new Error(`An error occurred at get '/readings': ${getReadingsError.message}`)
    ctx.status = 500;
    ctx.body = readingsError.message;
    ctx.app.emit('error', readingsError, ctx);
    next();
  }

  ctx.status = 200;
  ctx.body = averageMonthlyUsages;
  next();
});

export default router;
