function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
    ];

    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
    ];

    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ['default'];
    let material = 'default';
    let object = 'default';

    const noop = () => {
    };

    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
    }

    function setGeometry() {
        if (!geometry) {
            const position = [];
            const texcoord = [];
            const normal = [];
            const color = [];
            webglVertexData = [
                position,
                texcoord,
                normal,
                color,
            ];
            geometry = {
                object,
                groups,
                material,
                data: {
                    position,
                    texcoord,
                    normal,
                    color,
                },
            };
            geometries.push(geometry);
        }
    }

    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
            // if this is the position index (index 0) and we parsed
            // vertex colors then copy the vertex colors to the webgl vertex color data
            if (i === 0 && objColors.length > 1) {
                geometry.data.color.push(...objColors[index]);
            }
        });
    }

    const keywords = {
        v(parts) {
            // if there are more than 3 values here they are vertex colors
            if (parts.length > 3) {
                objPositions.push(parts.slice(0, 3).map(parseFloat));
                objColors.push(parts.slice(3).map(parseFloat));
            } else {
                objPositions.push(parts.map(parseFloat));
            }
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            setGeometry();
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
        s: noop,    // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        g(parts) {
            groups = parts;
            newGeometry();
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(([, array]) => array.length > 0));
    }

    return {
        geometries,
        materialLibs,
    };
}

class Object_Reader {

    static parse(string) {

        let ret = {
            v_temp: [],
            v_temp_idx: [],
            vt_temp: [],
            vt_temp_idx: [],
            vn_temp: [],
            vn_temp_idx: [],
            v: null,
            vt: null,
            vn: null
        };
        let idx = 0;
        let idx_max = -1;
        let row_str = null;
        let space_split_arr = null;
        let slash_split_arr = null;
        let regexp_spaces = new RegExp("[ ]+");
        let regexp_slash = new RegExp("/");
        let triangle_face = false;
        while (true) {
            let old = idx;
            idx = this.Read_Line(string, idx);
            if (idx === -1) {
                break;
            }
            row_str = string.substring(old, idx - this.Get_Trailing_LineBreakers_Cnt(string, old, idx));
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
                            if (int > idx_max) {
                                idx_max = int;
                            }
                        } else if (k === 1) {
                            ret.vt_temp_idx.push(int);
                        } else if (k === 2) {
                            ret.vn_temp_idx.push(int);
                        }
                    }
                }
            } else if (space_split_arr[0] === "s") {

            }
        }

        ret.v = new Float32Array(ret.v_temp_idx.length * 3);
        ret.vt = new Float32Array(ret.vt_temp_idx.length * 3);
        ret.vn = new Float32Array(ret.vn_temp_idx.length * 3);

        for (let i = 0; i < ret.v_temp_idx.length; i++) {
            ret.v[3 * i] = ret.v_temp[3 * ret.v_temp_idx[i]];
            ret.v[3 * i + 1] = ret.v_temp[3 * ret.v_temp_idx[i] + 1];
            ret.v[3 * i + 2] = ret.v_temp[3 * ret.v_temp_idx[i] + 2];

            ret.vt[2 * ret.v_temp_idx[i]] = ret.vt_temp[2 * ret.vt_temp_idx[i]];
            ret.vt[2 * ret.v_temp_idx[i] + 1] = ret.vt_temp[2 * ret.vt_temp_idx[i] + 1];

            ret.vn[3 * i] = ret.vn_temp[3 * ret.vn_temp_idx[i]];
            ret.vn[3 * i + 1] = ret.vn_temp[3 * ret.vn_temp_idx[i] + 1];
            ret.vn[3 * i + 2] = ret.vn_temp[3 * ret.vn_temp_idx[i] + 2];
        }

        return ret;
    }

    static Read_Line(str, from) {

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

    static Get_Trailing_LineBreakers_Cnt(str, from_include, to_exclude) {

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

    init(cvs) {

        super.init(cvs);

        //创建mesh
        this.create_mesh("s3re_rect", false, 6);
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
        this.update_mesh_to_gpu("s3re_rect");

        //创建着色器
        this.__s3re_create_lighting_program();
    }

    __s3re_create_lighting_program() {

        let vs = `#version 300 es
              //傻逼精度玩意儿操死你的吗
              precision highp float;
              
              uniform mat4 u_mat4_m; // 到世界坐标系
              uniform mat4 u_mat4_vp;// 到相机坐标系再到裁剪空间(GPU会自动做透视除法转换到NDC坐标系)
              
              in vec4 v_vec4_pos;
              in vec4 v_vec4_normal;

              out vec4 f_vec4_pos_object;
              out vec4 f_vec4_normal_object;

              void main() {

                vec4 p = u_mat4_vp * u_mat4_m * v_vec4_pos;
                //p.z = pow(((p.z + 1.0) / 2.0), 10.0) * 2.0 - 1.0;
                gl_Position = p;
                f_vec4_pos_object = v_vec4_pos;
                f_vec4_normal_object = vec4(normalize(v_vec4_normal.xyz), 0);
              }
        `;

        let fs = `#version 300 es
              //傻逼精度玩意儿操死你的吗
              precision highp float;

              uniform vec4 u_vec4_color;
              uniform mat4 u_mat4_m_inv_trans; // 到物体坐标系
              uniform vec4 u_vec4_camera_pos_world;
              uniform vec4 u_vec4_point_light_world_pos;
              uniform float u_float_point_light_length;

              in vec4 f_vec4_pos_object;
              in vec4 f_vec4_normal_object;
              
              out vec4 s3re_FragColor;

              void main() {

                //转换到物体
                vec3 point_light_pos_object = (u_mat4_m_inv_trans * u_vec4_point_light_world_pos).xyz;
                vec3 camera_pos_object = (u_mat4_m_inv_trans * u_vec4_camera_pos_world).xyz;
                //计算direction
                vec3 light_direction = normalize(point_light_pos_object - f_vec4_pos_object.xyz);
                vec3 view_direction = normalize(camera_pos_object - f_vec4_pos_object.xyz);
                vec3 half_vector = normalize(light_direction + view_direction);
                //计算亮度和高光
                vec3 normal = normalize(f_vec4_normal_object.xyz);
                float specular = clamp(dot(normal, half_vector), 0.0, 1.0);
                specular = pow(specular, 128.0);
                float brightness = 1.0 - length(light_direction) / u_float_point_light_length;
                brightness *= clamp(dot(normal, light_direction), 0.0, 1.0);
                brightness = pow(clamp(brightness, 0.0 , 1.0), 2.0);
                vec4 color = mix(vec4(0, 0, 0, 1), u_vec4_color, brightness);
                //加入高光
                color = mix(color, vec4(1, 1, 1, 1.0), specular);
                //float z = pow(gl_FragCoord.z, 32.0);
                s3re_FragColor = color;
              }
        `;

        this.create_program_ctx("s3re_spot_light", vs, fs, {
            per_vertex: {
                v_vec4_pos: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0),
                v_vec4_normal: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0)
            },
            uniform: {
                u_mat4_m: SL_Type_Mat4, // 到世界坐标系
                u_mat4_m_inv_trans: SL_Type_Mat4, // 到物体坐标系
                u_mat4_vp: SL_Type_Mat4,// 到相机坐标系再到裁剪空间(GPU会自动做透视除法转换到NDC坐标系)
                u_vec4_color: SL_Type_Vec4,
                u_vec4_camera_pos_world: SL_Type_Vec4,
                u_vec4_point_light_world_pos: SL_Type_Vec4,
                u_float_point_light_length: SL_Type_Float
            }
        });
    }
}
