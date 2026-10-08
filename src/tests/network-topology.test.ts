import { describe, it, expect } from 'vitest';
import { buildTopologyLayout, getDeviceIp } from '../lib/network/network-2d-layout';
import { buildTopDownLayout } from '../lib/network/network-topdown-layout';
import { NETWORK_TOPOLOGY } from '../data/network/network-topology';

describe('Network 2D Topology Layout Engine', () => {
  it('generates a valid full school topology layout ("all")', () => {
    const layout = buildTopologyLayout('all');
    expect(layout.nodes.length).toBeGreaterThan(30);
    expect(layout.edges.length).toBeGreaterThan(20);

    // Bounds must be valid
    expect(layout.bounds.width).toBeGreaterThan(500);
    expect(layout.bounds.height).toBeGreaterThan(400);

    // Must include the central WAN node
    const wanNode = layout.nodes.find((n) => n.id === 'wan-isp');
    expect(wanNode).toBeDefined();

    // Must include both VNPT gateways
    const gwB = layout.nodes.find((n) => n.id === 'gw-vnpt-b');
    const gwA = layout.nodes.find((n) => n.id === 'gw-vnpt-a');
    expect(gwB).toBeDefined();
    expect(gwA).toBeDefined();
  });

  it('generates valid Cluster B & CD topology layout', () => {
    const layout = buildTopologyLayout('b-cd');
    expect(layout.nodes.length).toBeGreaterThan(15);

    // Hub 1 and PM1, PM2 must exist in cluster B & CD
    const hub1 = layout.nodes.find((n) => n.id === 'hub-1');
    const pm1Router = layout.nodes.find((n) => n.id === 'r-cd-pm1');
    const pm2Router = layout.nodes.find((n) => n.id === 'r-cd-pm2');
    expect(hub1).toBeDefined();
    expect(pm1Router).toBeDefined();
    expect(pm2Router).toBeDefined();
  });

  it('generates valid Cluster A topology layout', () => {
    const layout = buildTopologyLayout('a');
    expect(layout.nodes.length).toBeGreaterThan(15);

    // Gateway A, Hub 2, Hub 3, Hub 5, Hub 4 must exist
    expect(layout.nodes.some((n) => n.id === 'gw-vnpt-a')).toBe(true);
    expect(layout.nodes.some((n) => n.id === 'hub-2')).toBe(true);
    expect(layout.nodes.some((n) => n.id === 'hub-3')).toBe(true);
    expect(layout.nodes.some((n) => n.id === 'hub-4')).toBe(true);
    expect(layout.nodes.some((n) => n.id === 'hub-5')).toBe(true);
  });

  it('ensures all edges connect valid nodes present in the layout', () => {
    const layout = buildTopologyLayout('all');
    const nodeIds = new Set(layout.nodes.map((n) => n.id));

    for (const edge of layout.edges) {
      expect(nodeIds.has(edge.fromId)).toBe(true);
      expect(nodeIds.has(edge.toId)).toBe(true);
      expect(edge.path).toContain('M');
    }
  });

  it('resolves valid IP addresses or subnets for all topology devices', () => {
    for (const dev of NETWORK_TOPOLOGY.devices) {
      const ip = getDeviceIp(dev);
      expect(typeof ip).toBe('string');
      expect(ip.length).toBeGreaterThan(0);
    }
  });

  it('generates valid Top-Down layout matching sodotruong.jpg (1280x960 bounds)', () => {
    const topdown = buildTopDownLayout('all');
    expect(topdown.bounds.width).toBe(1280);
    expect(topdown.bounds.height).toBe(960);
    expect(topdown.nodes.length).toBeGreaterThan(30);
    expect(topdown.edges.length).toBeGreaterThan(20);

    // Verify key devices placed within realistic bounds
    const gwB = topdown.nodes.find((n) => n.id === 'gw-vnpt-b');
    const gwA = topdown.nodes.find((n) => n.id === 'gw-vnpt-a');
    const hub1 = topdown.nodes.find((n) => n.id === 'hub-1');

    expect(gwB).toBeDefined();
    expect(gwA).toBeDefined();
    expect(hub1).toBeDefined();

    expect(gwB!.x).toBeGreaterThan(300);
    expect(gwB!.x).toBeLessThan(600);
    expect(gwA!.x).toBeGreaterThan(1000);

    // Verify PM1 and PM2 each have per-switch PC clusters
    expect(topdown.nodes.some((n) => n.id === 'pc-pm1-c1')).toBe(true);
    expect(topdown.nodes.some((n) => n.id === 'pc-pm1-c2')).toBe(true);
    expect(topdown.nodes.some((n) => n.id === 'pc-pm1-c3')).toBe(true);
    expect(topdown.nodes.some((n) => n.id === 'pc-pm2-c1')).toBe(true);
    expect(topdown.nodes.some((n) => n.id === 'pc-pm2-c2')).toBe(true);
    expect(topdown.nodes.some((n) => n.id === 'pc-pm2-c3')).toBe(true);

    // Verify Dãy A ground floor rooms (P.01 - P.06) are located in the Ground Floor Column (x < 1110)
    const pcP01 = topdown.nodes.find((n) => n.id === 'pc-p01');
    const pcP06 = topdown.nodes.find((n) => n.id === 'pc-p06');
    expect(pcP01).toBeDefined();
    expect(pcP06).toBeDefined();
    expect(pcP01!.x).toBeLessThan(1110);
    expect(pcP01!.x).toBeGreaterThan(1052);
    expect(pcP06!.x).toBeLessThan(1110);
    expect(pcP06!.x).toBeGreaterThan(1052);

    // Verify Dãy A upper floor rooms (P.07 - P.12) are located in Upper Floor Column (x > 1110)
    const pcP07 = topdown.nodes.find((n) => n.id === 'pc-p07');
    const pcP12 = topdown.nodes.find((n) => n.id === 'pc-p12');
    expect(pcP07).toBeDefined();
    expect(pcP12).toBeDefined();
    expect(pcP07!.x).toBeGreaterThan(1110);
    expect(pcP12!.x).toBeGreaterThan(1110);
  });
});
