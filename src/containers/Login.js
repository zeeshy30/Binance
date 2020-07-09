import React from 'react';
import { withRouter } from 'react-router-dom';
import 'antd/dist/antd.css';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import jwt_decode from "jwt-decode";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = (props) => {

    const onFinish = values => {
        axios.post('http://localhost:3001/api/user', values).then(res => {
            props.history.push('/home');
        }).catch(err => {
            alert(err);
        })
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Row type='flex' justify='center' align='center'>
            <Col>
                <Title level={2}> Login </Title>
                <Form
                    name="basic"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your email!',
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
                <Row type='flex' justify='start' align='top'>
                    <Col>
                        <Text strong>
                            New here? Create
                                <Link to='/signup'> an account</Link>
                        </Text>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default withRouter(Login);