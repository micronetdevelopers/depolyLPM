import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Radio,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  Select, Modal, message
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import MapMount from './MapMount'
import L from "leaflet";
import { useMap } from "../../context/MapContext";
const { TextArea } = Input;
const { Option } = Select;
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import extract from "png-chunks-extract";
import text from "png-chunk-text";



function ApplicationForm() {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);


  const {
    map,
    // mapRef,
    mapContainerRef,
    selectedBasemap,
    setSelectedBasemap,
    mapLoading, setMapLoading,
    loadingWmsCount, setLoadingWmsCount,
    progress, setProgress } = useMap();
  const currentParcelLayer = useRef({
    adjacentParcels: null,
  });

  const PARCEL_SELECTION_KEY = "parcelSelection";
  const parcelSelection = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("parcelSelection")) || {};
    } catch {
      return {};
    }
  }, []);

  // console.log(parcelSelection)

  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("✔ Submission payload", values);
  };

  // useEffect(() => {
  //   if (!map || !parcelSelection?.adjacentParcels) return;   // map is ready

  //   // 🔄 remove old layer
  //   if (currentParcelLayer.current.adjacentParcels) {
  //     map.removeLayer(currentParcelLayer.current.adjacentParcels);
  //   }

  //   // ➕ add new layer
  //   const layer = L.geoJSON(parcelSelection.adjacentParcels, {
  //     style: ({ properties: { target } }) => ({
  //       color: target === 0 || target === "0" ? "orange" : "cyan",
  //       weight: 2,
  //       fillOpacity: 0.4,
  //     }),
  //   }).addTo(map);

  //   map.fitBounds(layer.getBounds(), { padding: [20, 20] });

  //   currentParcelLayer.current.adjacentParcels = layer;

  //   return () => map.removeLayer(layer);
  // }, [map, parcelSelection, currentParcelLayer]);


  //   const summaryText = `
  // State: ${parcelSelection.selectedState || ""}
  // District: ${parcelSelection.selectedDistrict || ""}
  // Taluk: ${parcelSelection.selectedTaluka || ""}
  // Village: ${parcelSelection.selectedVillage || ""}
  // Parcel No: ${parcelSelection.selectedParcel || ""}
  // `.trim();
  const formItemStyle = {
    style: { marginBottom: 12 },
    labelCol: { style: { paddingBottom: 4 } },
  };

  const handleBack = () => {
    // Optional logic here
    navigate('/modules');
  };

  // ───────── helper to read embedded GeoJSON properties ──────────
  async function readGeoJsonMeta(file) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const chunks = extract(bytes);

    for (const chunk of chunks) {
      if (chunk.name !== "tEXt") continue;
      const { keyword, text: txt } = text.decode(chunk);
      if (keyword === "geojson-properties") {
        return JSON.parse(txt); // ← success
      }
    }
    throw new Error("No geojson-properties tEXt chunk found");
  }


  const handleBeforeUpload = async (file) => {
    if (fileList.length > 0) {
      return new Promise((resolve) => {
        Modal.confirm({
          title: "Replace uploaded file?",
          content:
            "You have already uploaded a file. Do you want to remove it and upload the new one?",
          okText: "Yes, replace",
          cancelText: "No",
          onOk: async () => {
            try {
              const meta = await readGeoJsonMeta(file);
              console.log("📦 Embedded metadata →", meta);
            } catch (err) {
              console.warn("⚠️ PNG has no embedded metadata:", err);
              message.warning("Uploaded image has no embedded metadata.");
            }
            if (fileList.length > 0) {
              console.log("1 ", fileList)
              setFileList([file]);
            }
            resolve(false); // prevent default upload, we'll handle manually
          },
          onCancel: () => {
            // form.resetFields(['landDoc']);
            resolve(false); // cancel upload
            console.log("2", fileList)
          },
        });
      });
    } else {
      try {
        const meta = await readGeoJsonMeta(file);
        console.log("📦 Embedded metadata →", meta);
      } catch (err) {
        console.warn("⚠️ PNG has no embedded metadata:", err);
        message.warning("Uploaded image has no embedded metadata.");
      }
      if (fileList.length > 0) {
        setFileList([file]);
        console.log("3", fileList)
      }
      return false; // prevent default upload
    }
  };

  const handleChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      setFileList(newFileList);
      console.log("🐕‍🦺", newFileList)
    }
    // console.log("😎", newFileList)
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 md:p-10">
        <Form
          form={form}
          name="application_from"
          initialValues={{
            state: parcelSelection.selectedState,
            district: parcelSelection.selectedDistrict,
            taluk: parcelSelection.selectedTaluka,
            village: parcelSelection.selectedVillage,
            parcelNo: parcelSelection.selectedParcel,
          }}
          layout="vertical"
          onFinish={onFinish}
          scrollToFirstError
        >
          {/* Personal Details */}
          <h2 className="font-semibold text-lg underline">Personal Details</h2>
          <Row gutter={16} >
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="FirstName"
                label="First Name"
                rules={[{ required: true, message: "Please enter your First name" }]}
                {...formItemStyle}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="MiddleName"
                label="Middle Name"
                rules={[{ message: "Please enter your middle name" }]}
                {...formItemStyle}
              >
                <Input placeholder="Middle name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="LastName"
                label="Last Name"
                rules={[{ required: true, message: "Please enter your last name" }]}
                {...formItemStyle}
              >
                <Input placeholder="Last name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="gender" label="Gender" {...formItemStyle}>
                <Radio.Group>
                  <Radio value="M">Male</Radio>
                  <Radio value="F">Female</Radio>
                  <Radio value="T">Trans</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                rules={[{ message: "Please select date of birth" }]}
                {...formItemStyle}
              >
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="mobile"
                label="Mobile"
                rules={[
                  { required: true, message: "Please enter mobile number" },
                  { pattern: /^\d{10}$/, message: "Mobile number should be 10 digits" },
                ]}
                {...formItemStyle}
              >
                <Input placeholder="10‑digit mobile" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="altMobile"
                label="Alternate Mobile"
                rules={[{ pattern: /^\d{10}$/, message: "Alternate mobile should be 10 digits" }]}
                {...formItemStyle}
              >
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="email"
                label="Email ID"
                rules={[{ required: true, type: "email", message: "Please enter email" }]}
                {...formItemStyle}
              >
                <Input placeholder="example@domain.com" />
              </Form.Item>
            </Col>
          </Row>

          {/* Land Details */}
          <h2 className="font-semibold text-lg mt-8 underline">Land Details</h2>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ownerFirstName"
                label="Owner First Name"
                rules={[{ required: true }]}
                {...formItemStyle}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="ownerMiddleName" label="Owner Middle Name" {...formItemStyle}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ownerLastName"
                label="Owner Last Name"
                rules={[{ required: true }]}
                {...formItemStyle}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {/* <Col span={24}>
              <Form.Item name="fatherName" label="Father's Name">
                <Input />
              </Form.Item>
            </Col> */}
            <Col xs={24} sm={8}>
              <Form.Item
                name="ownerFatherFirstName"
                label="Owner Father First Name"
                rules={[{ required: true }]}
                {...formItemStyle}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="ownerFatherMiddleName" label="Owner Father Middle Name" {...formItemStyle}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ownerFatherLastName"
                label="Owner Father Last Name"
                rules={[{ required: true }]}
                {...formItemStyle}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* <Form.Item
            name="landDoc"
            label="Upload Land Details (.png)"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Please upload land document" }]}
            {...formItemStyle}
          >
            <Upload.Dragger
              accept=".png"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const meta = await readGeoJsonMeta(file);
                  console.log("📦 Embedded metadata →", meta);
                } catch (err) {
                  console.warn("⚠️  PNG has no embedded metadata:", err);
                }
                return false; // prevent actual upload
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Upload.Dragger>
          </Form.Item> */}
          <Form.Item
            name="landDoc"
            label="Upload Land Details (.png)"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Please upload land document" }]}
            {...formItemStyle}
            id="para"
          >
            <Upload.Dragger
              accept=".png"
              maxCount={1}
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onChange={handleChange}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Upload.Dragger>
          </Form.Item>

          {/* Land Location */}
          <h3 className="font-medium underline">Land Location</h3>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="state" label="State" rules={[{ required: true }]} {...formItemStyle}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="district" label="District" rules={[{ required: true }]} {...formItemStyle}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="taluk" label="Taluk" rules={[{ required: true }]} {...formItemStyle}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="village" label="Village" rules={[{ required: true }]} {...formItemStyle}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="parcelNo" label="Parcel No." rules={[{ required: true }]} {...formItemStyle}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={9}>
              <Form.Item {...formItemStyle}>
                <div
                  style={{
                    border: "1px dashed #d9d9d9",
                    padding: 12,
                    borderRadius: 4,
                    color: "#333",
                    background: "#fafafa",
                  }}
                >
                  <Row>
                    <Col span={8} style={{ fontWeight: "bold" }}>State:</Col>
                    <Col span={16}>{parcelSelection.selectedState || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col span={8} style={{ fontWeight: "bold" }}>District:</Col>
                    <Col span={16}>{parcelSelection.selectedDistrict || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col span={8} style={{ fontWeight: "bold" }}>Taluk:</Col>
                    <Col span={16}>{parcelSelection.selectedTaluka || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col span={8} style={{ fontWeight: "bold" }}>Village:</Col>
                    <Col span={16}>{parcelSelection.selectedVillage || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col span={8} style={{ fontWeight: "bold" }}>Parcel No:</Col>
                    <Col span={16}>{parcelSelection.selectedParcel || "N/A"}</Col>
                  </Row>
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={15}>
              <Form.Item {...formItemStyle}>
                <div
                  style={{
                    border: "1px dashed #d9d9d9",
                    padding: 12,
                    borderRadius: 4,
                    color: "#333",
                    background: "#fafafa",
                  }}
                >
                  <MapMount style={{ height: "20vh", width: "100%" }} />
                </div>
              </Form.Item>
            </Col>
          </Row>

          {/* Communication Address */}
          <h2 className="font-semibold text-lg mt-8 underline">Address for Communication / Correspondence</h2>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="address1" label="Address Line 1" {...formItemStyle} rules={[{ required: true }]}>
                <TextArea autoSize />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="address2" label="Address Line 2" {...formItemStyle}>
                <TextArea autoSize />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="commState" label="State" rules={[{ required: true }]} {...formItemStyle}>
                <Select placeholder="Select state">
                  <Option value="Maharashtra">Maharashtra</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="commDistrict" label="District" rules={[{ required: true }]} {...formItemStyle}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="city" label="City / Town" rules={[{ required: true }]} {...formItemStyle}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="pin"
                label="PIN"
                rules={[
                  { required: true, message: "Please enter PIN" },
                  { pattern: /^\d{6}$/, message: "PIN should be 6 digits" },
                ]}
                {...formItemStyle}
              >
                <Input maxLength={6} />
              </Form.Item>
            </Col>
          </Row>

          {/* Actions */}
          <Form.Item style={{ textAlign: "right" }} >
            <Button style={{ marginRight: 8 }} onClick={handleBack}>
              Back
            </Button>
            <Button style={{ marginRight: 8 }}>Save</Button>
            <Button type="primary" htmlType="submit">
              Register Request
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ApplicationForm;
