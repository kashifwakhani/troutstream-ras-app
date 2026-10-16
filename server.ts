import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Enable CORS for mobile apps, Capacitor, and remote clients
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// In-memory backend storage for REST API
let tanksDB = [
  {
    id: 'tank-1',
    name: 'Nursery Tank 1',
    code: 'T-01',
    type: 'circular',
    volumeM3: 15,
    fishCount: 12000,
    avgWeightG: 18.5,
    estimatedBiomassKg: 222.0,
    densityKgM3: 14.8,
    status: 'active',
  },
  {
    id: 'tank-2',
    name: 'Juvenile Tank 2',
    code: 'T-02',
    type: 'circular',
    volumeM3: 25,
    fishCount: 7200,
    avgWeightG: 78.0,
    estimatedBiomassKg: 561.6,
    densityKgM3: 22.46,
    status: 'active',
  },
  {
    id: 'tank-3',
    name: 'Growout Tank 3',
    code: 'T-03',
    type: 'circular',
    volumeM3: 40,
    fishCount: 4800,
    avgWeightG: 235.0,
    estimatedBiomassKg: 1128.0,
    densityKgM3: 28.2,
    status: 'active',
  },
  {
    id: 'tank-4',
    name: 'Growout Tank 4 (Finishing)',
    code: 'T-04',
    type: 'circular',
    volumeM3: 40,
    fishCount: 3950,
    avgWeightG: 430.0,
    estimatedBiomassKg: 1698.5,
    densityKgM3: 42.46,
    status: 'active',
  },
];

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'Rainbow Trout RAS Manager',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Farm Info
app.get('/api/farm', (req: Request, res: Response) => {
  res.json({
    id: 'farm-alpine-1',
    name: 'Alpine Crest RAS Trout Farm',
    species: 'Rainbow Trout (Oncorhynchus mykiss)',
    totalWaterVolumeM3: 120,
    activeTanks: tanksDB.length,
    totalFish: tanksDB.reduce((sum, t) => sum + t.fishCount, 0),
    totalBiomassKg: tanksDB.reduce((sum, t) => sum + t.estimatedBiomassKg, 0),
  });
});

// Get Tanks
app.get('/api/tanks', (req: Request, res: Response) => {
  res.json(tanksDB);
});

// Transactional Fish Transfer
app.post('/api/tanks/transfer', (req: Request, res: Response) => {
  const { sourceTankId, destTankId, fishCount, operator, reason } = req.body;
  if (!sourceTankId || !destTankId || !fishCount || fishCount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer payload' });
  }

  const source = tanksDB.find((t) => t.id === sourceTankId);
  const dest = tanksDB.find((t) => t.id === destTankId);

  if (!source || !dest) {
    return res.status(404).json({ error: 'Source or destination tank not found' });
  }

  if (source.fishCount < fishCount) {
    return res.status(400).json({
      error: `Insufficient fish in source tank. Available: ${source.fishCount}, requested: ${fishCount}`,
    });
  }

  // Execute transfer
  source.fishCount -= fishCount;
  source.estimatedBiomassKg = Number(((source.fishCount * source.avgWeightG) / 1000).toFixed(2));
  source.densityKgM3 = Number((source.estimatedBiomassKg / source.volumeM3).toFixed(2));

  const totalDestFish = dest.fishCount + fishCount;
  const newAvgWeight = (dest.fishCount * dest.avgWeightG + fishCount * source.avgWeightG) / totalDestFish;
  dest.fishCount = totalDestFish;
  dest.avgWeightG = Number(newAvgWeight.toFixed(1));
  dest.estimatedBiomassKg = Number(((dest.fishCount * dest.avgWeightG) / 1000).toFixed(2));
  dest.densityKgM3 = Number((dest.estimatedBiomassKg / dest.volumeM3).toFixed(2));

  res.json({
    success: true,
    message: `Transferred ${fishCount} trout from ${source.name} to ${dest.name}`,
    transferredFish: fishCount,
    sourceTank: source,
    destTank: dest,
    totalFarmFish: tanksDB.reduce((sum, t) => sum + t.fishCount, 0),
  });
});

// Emerson Equation for toxic un-ionized ammonia
app.post('/api/calculations/nh3', (req: Request, res: Response) => {
  const { tan, ph, tempC } = req.body;
  if (tan === undefined || ph === undefined || tempC === undefined) {
    return res.status(400).json({ error: 'Missing tan, ph, or tempC parameters' });
  }
  const tempK = Number(tempC) + 273.15;
  const pKa = 0.09018 + 2729.92 / tempK;
  const f = 1 / (Math.pow(10, pKa - Number(ph)) + 1);
  const nh3 = Number(tan) * f;
  res.json({
    tanMgL: Number(tan),
    ph: Number(ph),
    tempC: Number(tempC),
    unionizedAmmoniaMgL: Number(nh3.toFixed(4)),
    isDangerousForTrout: nh3 > 0.02,
  });
});

async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TroutStream RAS Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
});
