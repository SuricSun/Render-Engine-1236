class S3RE_OBJ_Parser {

    static Parse(string) {

        let ret = {
            v_temp: [],
            v_temp_idx: [],
            vt_temp: [],
            vt_temp_idx: [],
            vn_temp: [],
            vn_temp_idx: [],
            vertex_cnt: -1,
            position_buffer: null,
            uv_buffer: null,
            normal_buffer: null
        };
        let idx = 0;
        let row_str = null;
        let space_split_arr = null;
        let slash_split_arr = null;
        let regexp_spaces = new RegExp("[ ]+");
        let regexp_slash = new RegExp("/");
        while (true) {
            let old = idx;
            idx = this.__Read_Line(string, idx);
            if (idx === -1) {
                break;
            }
            row_str = string.substring(old, idx - this.__Get_Trailing_LineBreakers_Cnt(string, old, idx));
            space_split_arr = row_str.split(regexp_spaces);
            if (space_split_arr[0] === 'v') {
                if (space_split_arr.length !== 4) {
                    throw new Error("顶点不为三维顶点: " + row_str);
                }
                for (let i = 1; i < space_split_arr.length; i++) {
                    let float = parseFloat(space_split_arr[i]);
                    if (Number.isFinite(float) === false) {
                        throw new Error("error parsing number: " + space_split_arr[i]);
                    }
                    ret.v_temp.push(float);
                }
            } else if (space_split_arr[0] === 'vt') {
                if (space_split_arr.length !== 3) {
                    throw new Error("纹理坐标不为二维: " + row_str);
                }
                for (let i = 1; i < space_split_arr.length; i++) {
                    let float = parseFloat(space_split_arr[i]);
                    if (Number.isFinite(float) === false) {
                        throw new Error("error parsing number: " + space_split_arr[i]);
                    }
                    ret.vt_temp.push(float);
                }
            } else if (space_split_arr[0] === 'vn') {
                if (space_split_arr.length !== 4) {
                    throw new Error("法线不为三维顶点: " + row_str);
                }
                for (let i = 1; i < space_split_arr.length; i++) {
                    let float = parseFloat(space_split_arr[i]);
                    if (Number.isFinite(float) === false) {
                        throw new Error("error parsing number: " + space_split_arr[i]);
                    }
                    ret.vn_temp.push(float);
                }
            } else if (space_split_arr[0] === 'f') {
                if (space_split_arr.length !== 4) {
                    throw new Error("索引不为三角形: " + row_str);
                }
                for (let i = 1; i < space_split_arr.length; i++) {
                    slash_split_arr = space_split_arr[i].split(regexp_slash);
                    if (slash_split_arr.length !== 3) {
                        throw new Error("索引太少: " + space_split_arr[i]);
                    }
                    for (let k = 0; k < slash_split_arr.length; k++) {
                        let int = parseInt(slash_split_arr[k]);
                        if (Number.isFinite(int) === false) {
                            throw new Error("error parsing int: " + slash_split_arr[k]);
                        }
                        int--;
                        if (k === 0) {
                            ret.v_temp_idx.push(int);
                        } else if (k === 1) {
                            ret.vt_temp_idx.push(int);
                        } else if (k === 2) {
                            ret.vn_temp_idx.push(int);
                        }
                    }
                }
            } else if (space_split_arr[0] === "s") {
                //NOT IMPLEMENTED YET
            }
        }

        //判断合法性
        if (ret.v_temp_idx.length !== ret.vt_temp_idx.length
            || ret.v_temp_idx.length !== ret.vn_temp_idx.length
            || ret.vt_temp_idx.length !== ret.vn_temp_idx.length) {
            throw new Error("OBJ文件格式错误: 顶点, uv, 法线 索引数量不一致");
        }

        ret.vertex_cnt = ret.v_temp_idx.length;
        ret.position_buffer = new Float32Array(ret.v_temp_idx.length * 3);
        ret.uv_buffer = new Float32Array(ret.vt_temp_idx.length * 2);
        ret.normal_buffer = new Float32Array(ret.vn_temp_idx.length * 3);

        for (let i = 0; i < ret.v_temp_idx.length; i++) {
            ret.position_buffer[3 * i] = ret.v_temp[3 * ret.v_temp_idx[i]];
            ret.position_buffer[3 * i + 1] = ret.v_temp[3 * ret.v_temp_idx[i] + 1];
            ret.position_buffer[3 * i + 2] = ret.v_temp[3 * ret.v_temp_idx[i] + 2];

            ret.uv_buffer[2 * i] = ret.vt_temp[2 * ret.vt_temp_idx[i]];
            ret.uv_buffer[2 * i + 1] = ret.vt_temp[2 * ret.vt_temp_idx[i] + 1];

            ret.normal_buffer[3 * i] = ret.vn_temp[3 * ret.vn_temp_idx[i]];
            ret.normal_buffer[3 * i + 1] = ret.vn_temp[3 * ret.vn_temp_idx[i] + 1];
            ret.normal_buffer[3 * i + 2] = ret.vn_temp[3 * ret.vn_temp_idx[i] + 2];
        }

        return ret;
    }

    static __Read_Line(str, from) {

        if (from >= str.length) {
            return -1;
        }
        while (true) {
            if (from >= str.length) {
                return from;
            }
            if (str.at(from) === "\r" || str.at(from) === "\n") {
                while (true) {
                    if (from >= str.length) {
                        return from;
                    }
                    if (str.at(from) !== "\r" && str.at(from) !== "\n") {
                        return from;
                    }
                    from++;
                }
            }
            from++;
        }
    }

    static __Get_Trailing_LineBreakers_Cnt(str, from_include, to_exclude) {

        let i;
        for (i = to_exclude - 1; i >= from_include; i--) {
            if (str.at(i) !== "\r" && str.at(i) !== "\n") {
                break;
            }
        }
        return to_exclude - i - 1;
    }
}

/**
 * 支持光照渲染
 */
class S3R_Extend extends Simple_3D_Renderer {

    __camera = {
        transform: new Transform(),
        transform_pos_data: new Float32Array(4),
        projection_matrix: new Matrix4x4(),
        camera_inv: new Matrix4x4(),
        mat_vp: new Matrix4x4()
    };

    __p_light = {
        transform: new Transform(),
        transform_pos_data: new Float32Array(4),
        length: 1,
        length_data: new Float32Array(1),
    };

    init(cvs) {

        super.init(cvs);

        //创建mesh
        this.create_mesh("s3re_rect", 6, false);
        this.update_mesh_attribute(
            "s3re_rect",
            "v_vec4_pos",
            [-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0],
            Array_Buffer_Desc.ELEM_TYPE_FLOAT,
            3,
            false,
            3,
            0
        );
        this.update_mesh_attribute(
            "s3re_rect",
            "v_vec4_normal",
            [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
            Array_Buffer_Desc.ELEM_TYPE_FLOAT,
            3,
            false,
            3,
            0
        );
        this.update_mesh_attribute(
            "s3re_rect",
            "v_vec2_uv",
            [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1],
            Array_Buffer_Desc.ELEM_TYPE_FLOAT,
            2,
            false,
            2,
            0
        );
        this.update_mesh_to_gpu("s3re_rect");

        //创建着色器
        this.__s3re_create_lighting_program();
    }

    set_camera_pos(x, y, z) {

        this.__camera.transform.set_translation(x, y, z);
    }

    set_camera_perspective_projection(near, far, fovy, aspect) {

        this.__camera.projection_matrix.clear_and_init_with_perspective(near, far, fovy, aspect);
    }

    set_p_light(x, y, z, length) {

        this.__p_light.transform.set_translation(x, y, z);
        this.__p_light.length = length;
    }

    prepare_camera_uniform() {

        if (this.__camera.transform.need_update()) {
            this.__camera.transform.update_transform_matrix();
            this.__camera.transform.__inner_matrix4x4.inverse(this.__camera.camera_inv);
            this.__camera.projection_matrix.multiply4x4(this.__camera.camera_inv, this.__camera.mat_vp);
            S3R_Utility.Array_Copy(this.__camera.transform.__translation, 0, this.__camera.transform_pos_data, 0, Infinity, true);
        }
    }

    prepare_p_light_uniform() {

        if (this.__p_light.transform.need_update()) {
            S3R_Utility.Array_Copy(this.__p_light.transform.__translation, 0, this.__p_light.transform_pos_data, 0, Infinity, true);
        }
        this.__p_light.length_data[0] = this.__p_light.length;
    }

    upload_cross_go_uniform(go) {

        //获取go的uniform location
        //有的话就设置
        for (let kv of go.get_component(Material).program_ctx_used.__uniform_location_map) {
            if (kv[0] === "s3re_u_mat4_vp" && Object.is(kv[1].data_type, SL_Type_Mat4)) {
                this.prepare_camera_uniform();
                super.upload_uniform_with_arr(kv[1].location, SL_Type_Mat4, this.__camera.mat_vp.data, 0);
            } else if (kv[0] === "s3re_u_vec4_camera_pos_world" && Object.is(kv[1].data_type, SL_Type_Vec4)) {
                this.prepare_camera_uniform();
                super.upload_uniform_with_arr(kv[1].location, SL_Type_Vec4, this.__camera.transform_pos_data, 0);
            } else if (kv[0] === "s3re_u_vec4_p_light_pos_world" && Object.is(kv[1].data_type, SL_Type_Vec4)) {
                this.prepare_p_light_uniform();
                super.upload_uniform_with_arr(kv[1].location, SL_Type_Vec4, this.__p_light.transform_pos_data, 0);
            } else if (kv[0] === "s3re_u_float_p_light_length" && Object.is(kv[1].data_type, SL_Type_Float32)) {
                this.prepare_p_light_uniform();
                super.upload_uniform_with_arr(kv[1].location, SL_Type_Float32, this.__p_light.length_data, 0);
            }
        }
    }

    setup_render_state(go) {

        super.setup_render_state(go);
        this.upload_cross_go_uniform(go);
    }

    __s3re_create_lighting_program() {

        let vs = `#version 300 es
              //傻逼精度玩意儿操死你的吗
              precision highp float;
              
              uniform mat4 u_mat4_m; // 到世界坐标系
              uniform mat4 s3re_u_mat4_vp;// 到相机坐标系再到裁剪空间(GPU会自动做透视除法转换到NDC坐标系)
              
              in vec4 v_vec4_pos;
              in vec4 v_vec4_normal;
              in vec2 v_vec2_uv;

              out vec4 f_vec4_pos_object;
              out vec4 f_vec4_normal_object;
              out vec2 f_vec2_uv;

              void main() {

                gl_Position = s3re_u_mat4_vp * u_mat4_m * v_vec4_pos;
                f_vec4_pos_object = v_vec4_pos;
                f_vec4_normal_object = vec4(normalize(v_vec4_normal.xyz), 0);
                f_vec2_uv = v_vec2_uv;
              }
        `;

        let fs = `#version 300 es
              //傻逼精度玩意儿操死你的吗
              precision highp float;
              
              #define MAGIC_NUMBER 1.2364

              uniform vec4 u_vec4_color;
              uniform mat4 u_mat4_m_inv; // 到物体坐标系
              uniform vec4 s3re_u_vec4_camera_pos_world;
              uniform vec4 s3re_u_vec4_p_light_pos_world;
              uniform float s3re_u_float_p_light_length;
              
              uniform sampler2D u_s2d_tex;
              uniform sampler2D u_s2d_vid;

              in vec4 f_vec4_pos_object;
              in vec4 f_vec4_normal_object;
              in vec2 f_vec2_uv;

              out vec4 s3re_FragColor;

              void main() {

                //转换到物体
                vec3 point_light_pos_object = (u_mat4_m_inv * s3re_u_vec4_p_light_pos_world).xyz;
                vec3 camera_pos_object = (u_mat4_m_inv * s3re_u_vec4_camera_pos_world).xyz;
                //计算direction
                vec3 light_direction = point_light_pos_object - f_vec4_pos_object.xyz;
                vec3 view_direction = normalize(camera_pos_object - f_vec4_pos_object.xyz);
                vec3 half_vector = normalize(normalize(light_direction) + view_direction);
                //计算亮度和高光
                vec3 normal_object = normalize(f_vec4_normal_object.xyz);
                float brightness = 1.0 - length(light_direction) / s3re_u_float_p_light_length;
                brightness = clamp(brightness, 0.0, 1.0);
                brightness *= dot(normal_object, normalize(light_direction));
                brightness = pow(brightness, MAGIC_NUMBER);
                float specular = clamp(dot(normal_object, half_vector), 0.0, 1.0);
                specular = pow(specular, 128.0);
                specular *= brightness;
                //加入亮度
                vec2 y_inv_uv = f_vec2_uv;
                y_inv_uv.y = 1.0 - y_inv_uv.y;
                vec4 color = mix(vec4(0.0, 0.0, 0.0, 1.0), texture(u_s2d_tex, y_inv_uv) * 0.5 + texture(u_s2d_vid, y_inv_uv) * 0.5, brightness);
                //加入高光
                //color = mix(color, vec4(1.0, 1.0, 1.0, 1.0), specular);
                s3re_FragColor = color;
              }
        `;

        this.create_program_ctx("s3re_spot_light", vs, fs, {
            per_vertex: {
                v_vec4_pos: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0),
                v_vec4_normal: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0),
                v_vec2_uv: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 2, false, 2, 0)
            },
            uniform: {
                u_mat4_m: SL_Type_Mat4, // 到世界坐标系
                u_mat4_m_inv: SL_Type_Mat4, // 到物体坐标系
                u_vec4_color: SL_Type_Vec4,
                u_s2d_tex: SL_Type_Int32,
                u_s2d_vid: SL_Type_Int32,
                s3re_u_mat4_vp: SL_Type_Mat4,// 到相机坐标系再到裁剪空间(GPU会自动做透视除法转换到NDC坐标系)
                s3re_u_vec4_camera_pos_world: SL_Type_Vec4,
                s3re_u_vec4_p_light_pos_world: SL_Type_Vec4,
                s3re_u_float_p_light_length: SL_Type_Float32
            }
        });
    }
}
