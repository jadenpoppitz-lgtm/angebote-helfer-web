import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DemoDayCustomerLookup } from "@/components/DemoDayCustomerLookup";
import {
  DEMO_DAY_DEVICE_RECORDS,
  DEMO_DAY_TEST_WINNER_SERIAL,
} from "@/data/demoDayDevices";

afterEach(cleanup);

const searchFor = (serial: string) => {
  fireEvent.change(screen.getByLabelText(/Seriennummer deiner Demo-Karte/i), { target: { value: serial } });
  fireEvent.click(screen.getByRole("button", { name: /Gerät prüfen/i }));
};

describe("DemoDayCustomerLookup", () => {
  it("does not expose internal device or winner counts", () => {
    render(<DemoDayCustomerLookup language="de" />);

    expect(screen.queryByText("100 Geräteprofile")).not.toBeInTheDocument();
    expect(screen.queryByText("5 Goldtickets")).not.toBeInTheDocument();
  });

  it("adds serial-number separators automatically", () => {
    render(<DemoDayCustomerLookup language="de" />);
    const input = screen.getByLabelText(/Seriennummer deiner Demo-Karte/i);

    fireEvent.change(input, { target: { value: "lt26ab12cd34" } });

    expect(input).toHaveValue("LT26-AB12-CD34");
  });

  it("shows real Dresden return points around HTW Dresden", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => !device.winner)!;
    render(<DemoDayCustomerLookup language="de" />);
    searchFor(record.serial);

    expect(screen.getByRole("heading", { name: "Altgerät richtig abgeben" })).toBeInTheDocument();
    expect(screen.getByText(/Aktueller Standort · HTW Dresden/)).toBeInTheDocument();
    expect(screen.getByText("Wertstoffhof Friedrichstadt")).toBeInTheDocument();
    expect(screen.getByText("Wertstoffhof Plauen")).toBeInTheDocument();
    expect(screen.getByText("Wertstoffhof Johannstadt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Route öffnen: Wertstoffhof Friedrichstadt/ })).toHaveAttribute(
      "href",
      expect.stringContaining("openstreetmap.org"),
    );
  });

  it("shows the exact model and a compact metal summary for a valid serial", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => !device.winner)!;
    render(<DemoDayCustomerLookup language="de" />);

    searchFor(record.serial);

    expect(screen.getByRole("heading", { name: record.model })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Diese Metalle stecken in deinem Gerät" })).toBeInTheDocument();
    expect(screen.getAllByTestId("metal-summary-group")).toHaveLength(4);
    expect(screen.getByText("Basis- & Kreislaufmetalle")).toBeInTheDocument();
    expect(screen.getByText("Batterie & Speicher")).toBeInTheDocument();
    expect(screen.getByText("Edelmetalle")).toBeInTheDocument();
    expect(screen.getByText("Technologiemetalle")).toBeInTheDocument();
    expect(screen.getByText("Erfasste Metalle")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "So bleibt dein Gerät im Kreislauf" })).toBeInTheDocument();
    expect(screen.getByText(record.passportId)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Diesmal leider nicht gewonnen");
  });

  it("keeps the 3D model free of redundant category and source labels", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => device.kind === "headphones")!;
    render(<DemoDayCustomerLookup language="de" />);

    searchFor(record.serial);

    expect(screen.queryByText(record.category)).not.toBeInTheDocument();
    expect(screen.queryByText(/3D:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CreativeTrio/i)).not.toBeInTheDocument();
  });

  it("keeps technical evidence inside the sources disclosure", () => {
    const record = DEMO_DAY_DEVICE_RECORDS.find((device) => device.model.startsWith("Fairphone 5"))!;
    render(<DemoDayCustomerLookup language="de" />);

    searchFor(record.serial);
    fireEvent.click(screen.getByText("Quellen und Methodik"));

    expect(screen.getByRole("link", { name: record.sources[0].title })).toHaveAttribute("href", record.sources[0].url);
    expect(screen.queryByText("Datengrundlage")).not.toBeInTheDocument();
    expect(screen.queryByText("Herstellergewicht + wissenschaftliches Modell")).not.toBeInTheDocument();
  });

  it("explains an unknown serial without showing a stale device", () => {
    render(<DemoDayCustomerLookup language="de" />);

    searchFor("LT26-XXXX-XXXX");

    expect(screen.getByRole("alert")).toHaveTextContent("Diese Nummer kennen wir noch nicht");
    expect(screen.queryByRole("heading", { name: "Diese Metalle stecken in deinem Gerät" })).not.toBeInTheDocument();
  });

  it("reveals the gold winner state and celebration", () => {
    render(<DemoDayCustomerLookup language="de" />);

    searchFor(DEMO_DAY_TEST_WINNER_SERIAL);

    expect(screen.getByRole("heading", { name: "Du hast gewonnen!" })).toBeInTheDocument();
    expect(screen.getByTestId("winner-celebration")).toBeInTheDocument();
    expect(screen.getByTestId("winner-confetti").parentElement).toBe(document.body);
    expect(screen.getByText("Demo Gold Bar 2026")).toBeInTheDocument();
    expect(screen.queryByText("Diesmal leider nicht gewonnen")).not.toBeInTheDocument();
  });
});
