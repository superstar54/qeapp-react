from aiidalab_qe.common.bandpdoswidget import get_bands_labeling
import numpy as np

def prepare_data(data):
    if isinstance(data, dict):
        return {key: prepare_data(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [prepare_data(item) for item in data]
    elif isinstance(data, tuple):
        return list(data)
    elif isinstance(data, np.ndarray):
        return data.tolist()
    else:
        return data


def get_bands_data(bands_node, fermi_energy=None):
    """Extract the band structure data from a bands node."""
    if not bands_node.is_finished_ok:
        return None
    outputs = bands_node.outputs
    bands_data = outputs.bands.band_structure._get_bandplot_data(
        cartesian=True, prettify_format=None, join_symbol=None, get_segments=True
    )
    # The fermi energy from band calculation is not robust.
    if "fermi_energy_up" in outputs.bands.band_parameters:
        bands_data["fermi_energy_up"] = outputs.bands.band_parameters["fermi_energy_up"]
        bands_data["fermi_energy_down"] = outputs.bands.band_parameters["fermi_energy_down"]
    else:
        bands_data["fermi_energy"] = (
            outputs.bands.band_parameters["fermi_energy"] or fermi_energy
        )

    bands_data["pathlabels"] = get_bands_labeling(bands_data)
    bands_data = prepare_data(bands_data)
    return bands_data

def get_raw_pdos_data(proj_data, data_type="pdos"):
    data = []
    for orb_proj in proj_data:
        if data_type == "pdos":
            orbital, proj_pdos, energy = orb_proj
        elif data_type == "projections":
            orbital, proj_pdos = orb_proj
            energy = None
        orbital = orbital.get_orbital_dict()
        proj_pdos = proj_pdos.tolist()
        energy = energy.tolist() if energy is not None else None
        data.append({"orbital": orbital, "pdos": proj_pdos, "energy": energy})
    return data

def get_pdos_data(pdos_node):
    """Extract the PDOS data from a PDOS node."""
    print("pdos_node", pdos_node)
    if not pdos_node.is_finished_ok:
        return None
    outputs = pdos_node.outputs
    data = {}
    _, energy_dos, _ = outputs.dos.output_dos.get_x()
    tdos_values = {f"{n}": v.tolist() for n, v, _ in outputs.dos.output_dos.get_y()}
    data["energy_dos"] = energy_dos.tolist()
    data["tdos"] = tdos_values
    if "projections" in outputs.projwfc:
        pdos_data = outputs.projwfc.projections.get_pdos()
        proj_data = outputs.projwfc.projections.get_projections()
        data["projections"] = {"pdos": get_raw_pdos_data(pdos_data),
                                "projections": get_raw_pdos_data(proj_data, data_type="projections")
                                }
    else:
        pdos_data_up = outputs.projwfc.projections_up.get_pdos()
        proj_data_up = outputs.projwfc.projections_up.get_projections()
        pdos_data_down = outputs.projwfc.projections_down.get_pdos()
        proj_data_down = outputs.projwfc.projections_down.get_projections()
        data["projections_up"] = {"pdos": get_raw_pdos_data(pdos_data_up),
                                        "projections": get_raw_pdos_data(proj_data_up, data_type="projections")
                                    }
        data["projections_down"] = {"pdos": get_raw_pdos_data(pdos_data_down),
                                        "projections": get_raw_pdos_data(proj_data_down, data_type="projections")
                                    }
    if "fermi_energy_up" in outputs.nscf.output_parameters:
        data["fermi_energy_up"] = outputs.nscf.output_parameters["fermi_energy_up"]
        data["fermi_energy_down"] = outputs.nscf.output_parameters[
            "fermi_energy_down"
        ]
    else:
        data["fermi_energy"] = outputs.nscf.output_parameters["fermi_energy"]
    return data



