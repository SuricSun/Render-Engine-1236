/**
 * Simple_Renderer_Engine
 */

class RE1236_Utility {

    static Array_Copy(from, from_idx, to, to_idx, len, good_mode) {

        let len_from = from.length - from_idx;
        let len_to = to.length - to_idx;
        if (len > len_from || len > len_to) {
            if (good_mode) {
                len = Math.min(len_from, len_to);
            } else {
                throw new Error("Array_Copy越界");
            }
        }
        for (let i = 0; i < len; i++) {
            to[to_idx + i] = from[from_idx + i];
        }
    }
}

class Polygon_Triangulation {

    static Vec2D = class {

        __temp = null;

        x = 0;
        y = 0;

        init(x, y) {
            this.x = x;
            this.y = y;
        }

        set_from_to(p_from, p_to) {
            this.x = p_to.x - p_from.x;
            this.y = p_to.y - p_from.y;
        }

        dot_product(vec) {

            return this.x * vec.x + this.y * vec.y;
        }

        cross_product(vec) {

            return this.y * vec.x - this.x * vec.y;
        }

        rotate_self_x_2_y() {

            this.__temp = this.x;
            this.x = -this.y;
            this.y = this.__temp;
        }
    }


    static __Cached = {

        v0: new Polygon_Triangulation.Vec2D(),
        v1: new Polygon_Triangulation.Vec2D(),
        v: new Polygon_Triangulation.Vec2D(),
        arr: []
    };

    static List_Node = class {

        __list = null;
        __pre = null;
        __nxt = null;
        val = null;

        constructor(val) {

            this.__pre = this;
            this.__nxt = this;
            this.val = val;
        }

        insert_after_self(node) {

            node.__pre = this;
            node.__nxt = this.__nxt;

            this.__nxt.__pre = node;

            if (this.__pre === this) {
                this.__pre = node;
            }
            this.__nxt = node;

            //size++
            if (this.__list === null) {
                this.__list = {size: 1};
            }
            this.__list.size++;

            //传染list
            node.__list = this.__list;

            return node;
        }

        /**
         * 删除当前节点, 返回当前节点的下一个节点
         * @return {*|null|Polygon_Triangulation.List_Node}
         */
        remove_self() {

            this.__pre.__nxt = this.__nxt;
            this.__nxt.__pre = this.__pre;

            //size--
            this.__list.size--;

            let nxt = this.__nxt;

            this.__list = {size: 1};
            this.__pre = this;
            this.__nxt = this;

            return nxt;
        }

        /**
         * (node)=>{}
         *  返回假直接结束迭代，返回其他值被忽略, 一直迭代完整个链表
         * @param fn
         */
        iterate_from_self(fn) {
            let it = this;
            let natural_end = true;
            do {
                if (fn(it) === false) {
                    natural_end = false;
                    break;
                }
                it = it.__nxt;
            } while (it !== this);
            if (natural_end) {
                return null;
            }
            //不是自然结束的，就返回非自然结束的那个节点
            return it;
        }

        static Init_list_from_arr(arr) {

            if (arr === null) {
                return null;
            }
            let head = new Polygon_Triangulation.List_Node("flag");
            let node = head;
            arr.forEach((e) => {
                node = node.insert_after_self(new Polygon_Triangulation.List_Node(e));
            });
            //删除空head
            return head.remove_self();
        }
    }

    static Is_in_triangle(p, p0, p1, p2) {

        let cached = this.__Cached;
        let cached_arr = cached.arr;

        cached_arr.length = 0;
        cached_arr.push(p0, p1, p2);

        cached.v0.set_from_to(cached_arr[0], cached_arr[1]);
        cached.v1.set_from_to(cached_arr[1], cached_arr[2]);

        //确定方向
        let sign = cached.v0.cross_product(cached.v1) < 0;
        let prod = 0;
        for (let i = 0; i < 3; i++) {
            cached.v0.set_from_to(cached_arr[i], cached_arr[(i + 1) % 3]);
            //判断前后
            cached.v.set_from_to(cached_arr[i], p);
            prod = cached.v0.cross_product(cached.v);
            if (prod === 0) {
                //在边界上也算在三角形上
                //如果在边界不算在三角形上的话，会出现Glitch, 运算结果不符合的情况
                return true;
            }
            if ((cached.v0.cross_product(cached.v) < 0) !== sign) {
                return false;
            }
        }

        return true;
    }

    static get Natural_winding() {
        return 0;
    };

    static get Anti_Natural_winding() {
        return 1;
    }

    static get Unknown_winding() {
        return -1;
    }

    static Polygon = class {

        __head = null;
        __cur_min_x = Infinity;
        __cur_min_x_node = null;
        __winding = Polygon_Triangulation.Unknown_winding;

        init(pnts_arr, winding) {
            this.eat_arr(pnts_arr);
            this.__winding = winding;
        }

        is_points_cnt_available() {
            return this.__head.__list.size >= 3;
        }

        eat_arr(arr) {
            arr.forEach((pnt) => {
                this.push_pnt(pnt);
            });
        }

        push_pnt(pnt) {
            if (this.__head === null) {
                this.__head = new Polygon_Triangulation.List_Node(pnt);
            } else {
                this.__head.__pre.insert_after_self(new Polygon_Triangulation.List_Node(pnt));
            }
            if (pnt.x < this.__cur_min_x) {
                this.__cur_min_x = pnt.x;
                this.__cur_min_x_node = this.__head.__pre;
            }
        }

        /**
         * (node)=>{}
         * @param fn
         */
        iterate(fn) {
            this.__head.iterate_from_self(fn);
        }

        get_pnts_arr() {
            return this.__head.__nxt;
        }

        get_min_x_node() {
            return this.__cur_min_x_node;
        }
    }

    /**
     * 计算-x方向射线与线段相交, 参数是node而不是pnt
     * @param ray_ori
     * @param p0
     * @param p1
     * @param result_pack input an object like {point: null, is_end_point: false)}
     * @constructor
     */
    static Intersect_neg_x(ray_ori, p0, p1, result_pack) {

        //排序
        let t = null;
        if (p0.val.x > p1.val.x) {
            //交换
            t = p0;
            p0 = p1;
            p1 = t;
        }
        //此时p1.val.x总是大
        //解决特殊情况线段与x轴平行
        if (p0.val.y === p1.val.y) {
            if (ray_ori.val.y !== p0.val.y) {
                //无交点
                result_pack.node = null;
                result_pack.is_end_pnt = false;
                return;
            }
            if (ray_ori.val.x >= p1.val.x) {
                result_pack.node = p1;
                result_pack.is_end_pnt = true;
                return;
            }
            if (ray_ori.val.x >= p0.val.x) {
                result_pack.node = p0;
                result_pack.is_end_pnt = true;
                return;
            }
            result_pack.node = null;
            result_pack.is_end_pnt = false;
            return;
        }
        //检查是否经过端点
        if (ray_ori.val.x >= p0.val.x && ray_ori.val.y === p0.val.y) {
            result_pack.node = p0;
            result_pack.is_end_pnt = true;
            return;
        }
        if (ray_ori.val.x >= p1.val.x && ray_ori.val.y === p1.val.y) {
            result_pack.node = p1;
            result_pack.is_end_pnt = true;
            return;
        }
        //现在正常解决
        //按照y排序
        if (p0.val.y >/*不可能有等于*/ p1.val.y) {
            //交换
            t = p0;
            p0 = p1;
            p1 = t;
        }
        //此时p0.val.y总是小
        //计算t
        t = (ray_ori.val.y - p0.val.y) / (p1.val.y - p0.val.y);
        //检查交点的y
        if (t <= 0 || t >= 1) {
            //交点不在线段上
            result_pack.node = null;
            result_pack.is_end_pnt = false;
            return;
        }
        //获取交点的x
        let x = (1.0 - t) * p0.val.x + t * p1.val.x;
        if (x > ray_ori.val.x) {
            //交点不在射线原点-x方向
            result_pack.node = null;
            result_pack.is_end_pnt = false;
            return;
        }
        //有交点
        result_pack.node = new Polygon_Triangulation.List_Node({x: x, y: (1.0 - t) * p0.val.y + t * p1.val.y});
        result_pack.is_end_pnt = false;
        result_pack.min_x_node_on_line = p0.val.x < p1.val.x ? p0 : p1;
    }

    /**
     * 两个node应该来自不同的list
     * @param node0
     * @param node1
     * @private
     */
    static __Mix_diff_nodes_list(node0, node1) {

        //node0 <- node1
        //复制两个node
        let node0_copy = new Polygon_Triangulation.List_Node(node0.val);
        let node1_copy = new Polygon_Triangulation.List_Node(node1.val);
        node0.alias = node0_copy;
        node1.alias = node1_copy;
        node0_copy.alias = node0;
        node1_copy.alias = node1;
        //打标记
        //接入
        node1.__pre.insert_after_self(node1_copy);
        node1_copy.insert_after_self(node0_copy);

        node0_copy.__nxt = node0.__nxt;
        node0.__nxt.__pre = node0_copy;

        node0.__nxt = node1;
        node1.__pre = node0;
    }

    /**
     *
     * @param poly winding必须 不是hole_winding 且 不是Unknown_winding  且 顶点数量大于等于3
     * @param hole_poly_arr winding必须 是 hole_winding 且 顶点数量大于等于3
     * @param hole_winding 必须不是Unknown_winding
     * @constructor
     */
    static Triangulate_EC(poly, hole_poly_arr, hole_winding) {

        //检查
        if (hole_winding === Polygon_Triangulation.Unknown_winding) {
            throw new Error("hole_winding 必须不是Unknown_winding");
        }
        if (poly.__winding === hole_winding || poly.__winding === Polygon_Triangulation.Unknown_winding || poly.is_points_cnt_available() === false) {
            throw new Error("poly winding必须 不是 hole_winding且 不是 Unknown_winding 且 顶点数量大于等于3");
        }
        hole_poly_arr.forEach((hole_poly) => {
            if (hole_poly.__winding !== hole_winding || hole_poly.is_points_cnt_available() === false) {
                throw new Error("hole_poly_arr winding必须 是 hole_winding 且 顶点数量大于等于3");
            }
        });
        //开始牵红线
        //对hole进行x排序由小到大
        hole_poly_arr.sort((a, b) => {
            if (a.get_min_x_node().val.x < b.get_min_x_node().val.x) {
                return -1;
            } else if (a.get_min_x_node().val.x === b.get_min_x_node().val.x) {
                return 0;
            }
            return 1;
        });
        //遍历并且开始牵红线
        let min_x_node = null;
        let ret = {node: null, is_end_pnt: false, min_x_node_on_line: null};
        let min_distance_ret = {node: null, is_end_pnt: false, min_x_node_on_line: null};
        let in_triangle_node = [];
        hole_poly_arr.forEach((hole_poly) => {
            //循环获取交点
            min_x_node = hole_poly.get_min_x_node();
            min_distance_ret.node = null;
            min_distance_ret.is_end_pnt = false;
            min_distance_ret.min_x_node_on_line = null;
            poly.iterate((poly_node) => {
                //计算相交
                Polygon_Triangulation.Intersect_neg_x(min_x_node, poly_node, poly_node.__nxt, ret);
                if (ret.node !== null) {
                    //有交点
                    if (min_distance_ret.node !== null) {
                        if (ret.node.val.x > min_distance_ret.node.val.x) {
                            min_distance_ret.node = ret.node;
                            min_distance_ret.is_end_pnt = ret.is_end_pnt;
                            min_distance_ret.min_x_node_on_line = ret.min_x_node_on_line;
                        }
                    } else {
                        min_distance_ret.node = ret.node;
                        min_distance_ret.is_end_pnt = ret.is_end_pnt;
                        min_distance_ret.min_x_node_on_line = ret.min_x_node_on_line;
                    }
                }
            });
            //计算交点并且牵红线
            if (min_distance_ret.node !== null) {
                if (min_distance_ret.is_end_pnt) {
                    //直接牵线
                    Polygon_Triangulation.__Mix_diff_nodes_list(min_distance_ret.node, min_x_node);
                    //结束iterate
                    return false;
                } else {
                    //计算交点三角形内是否有其他点
                    in_triangle_node.length = 0;
                    poly.iterate((poly_node) => {
                        if (poly_node === min_distance_ret.min_x_node_on_line) {
                            //跳过循环
                            return true;
                        }
                        if (Polygon_Triangulation.Is_in_triangle(poly_node.val, min_x_node.val, min_distance_ret.node.val, min_distance_ret.min_x_node_on_line.val)) {
                            in_triangle_node.push(poly_node);
                        }
                    });
                    if (in_triangle_node.length === 0) {
                        //直接牵线
                        //牵线有最小x的
                        Polygon_Triangulation.__Mix_diff_nodes_list(min_distance_ret.min_x_node_on_line, min_x_node);
                        //结束iterate
                        return false;
                    } else {
                        //找到距离最小的最后牵线
                        in_triangle_node.sort((a, b) => {
                            let dis_a = Math.pow(a.val.x - min_x_node.val.x, 2) + Math.pow(a.val.y - min_x_node.val.y, 2);
                            let dis_b = Math.pow(b.val.x - min_x_node.val.x, 2) + Math.pow(b.val.y - min_x_node.val.y, 2);
                            if (dis_a < dis_b) {
                                return -1;
                            } else if (dis_a === dis_b) {
                                return 0;
                            }
                            return 1;
                        });
                        //牵线
                        Polygon_Triangulation.__Mix_diff_nodes_list(in_triangle_node[0], min_x_node);
                        //结束iterate
                        return false;
                    }
                }
            } else {
                //无交点
                throw new Error("Hole intersects with the outer polygon!");
            }
        });

        // return poly;
        //开始三角化
        let ear_node = null;
        let go_pre = false;
        let has_pnt_in_triangle = false;
        let result_triangles = [];
        let it_node = poly.__head;
        let none_hole_winding_sign = null;
        if (hole_winding === Polygon_Triangulation.Natural_winding) {
            none_hole_winding_sign = 1 <= 0;
        } else if (hole_winding === Polygon_Triangulation.Anti_Natural_winding) {
            none_hole_winding_sign = -1 <= 0;
        }
        while (true) {
            if (it_node.__pre === it_node.__nxt) {
                //顶点数量小于3，算法结束
                break;
            }
            ear_node = it_node.iterate_from_self((node_outer) => {
                //对于此顶点，观察与周围的两个顶点组合，是否成为凸顶点
                this.__Cached.v0.set_from_to(node_outer.__pre.val, node_outer.val);
                this.__Cached.v1.set_from_to(node_outer.val, node_outer.__nxt.val);
                if ((this.__Cached.v0.cross_product(this.__Cached.v1) <= 0) === none_hole_winding_sign) {
                    //找到凸三角形
                    //遍历保证没有顶点落在里面
                    has_pnt_in_triangle = false;
                    node_outer.__nxt.__nxt.iterate_from_self((node) => {
                        if (node === node_outer.__pre) {
                            //结束
                            return false;
                        }
                        if (node.alias === node_outer || node.alias === node_outer.__pre || node.alias === node_outer.__nxt) {
                            //跳过
                            return;
                        }
                        //是否在三角形内
                        if (Polygon_Triangulation.Is_in_triangle(node.val, node_outer.__pre.val, node_outer.val, node_outer.__nxt.val)) {
                            has_pnt_in_triangle = true;
                            //有三角形就跳过
                            return false;
                        }
                    });
                    if (has_pnt_in_triangle) {
                        //此顶点不满足要求，下一个
                    } else {
                        //找到合适的ear三角形
                        //提前退出
                        return false;
                    }
                }
            });
            if (ear_node === null) {
                //异常结束
                console.warn("Triangulate_EC异常结束: 多边形有重叠, 结果可能不尽人意");
                break;
            } else {
                result_triangles.push(ear_node.__pre.val, ear_node.val, ear_node.__nxt.val);
                //移除此顶点
                if (go_pre) {
                    it_node = ear_node.remove_self().__pre;
                } else {
                    it_node = ear_node.remove_self();
                }
                go_pre = !go_pre;
            }
        }
        return result_triangles;
    }
}

class Vector4 {

    __data = new Float32Array(4);

    get data() {

        return this.__data;
    }

    set_xyzw(x, y, z, w) {

        this.__data[0] = x;
        this.__data[1] = y;
        this.__data[2] = z;
        this.__data[3] = w;
    };

    copy_from(vec4) {

        this.__data[0] = vec4.data[0];
        this.__data[1] = vec4.data[1];
        this.__data[2] = vec4.data[2];
        this.__data[3] = vec4.data[3];
    }

    to_0001() {

        this.__data[0] = 0.0;
        this.__data[1] = 0.0;
        this.__data[2] = 0.0;
        this.__data[3] = 1.0;
    }
}

/**
 * Column Major Matrix
 */
class Matrix4x4 {

    static __temp_data = new Float32Array(16);

    __data = new Float32Array(16);

    get data() {

        return this.__data;
    }

    constructor() {

        this.to_identity();
    }

    /**
     * 意为先应用矩阵in4x4再应用矩阵this
     * 形象理解为this矩阵时in4x4的父矩阵, in4x4随着父亲this的变换而变换
     * @param in4x4
     * @param out4x4
     */
    multiply4x4(in4x4, out4x4) {

        if (in4x4 instanceof Matrix4x4 === false || out4x4 instanceof Matrix4x4 === false) {
            throw new Error("错误的参数类型, 需要Matrix4x4");
        }

        // column major
        // x  y  z  w
        // -----------
        // 0  4  8  12
        // 1  5  9  13
        // 2  6  10 14
        // 3  7  11 15
        // -----------

        let l = this.data;//左边
        let r = in4x4.data;//右边
        let o = out4x4.data;//输出

        // l * r

        o[0] = l[0] * r[0] + l[4] * r[1] + l[8] * r[2] + l[12] * r[3];
        o[1] = l[1] * r[0] + l[5] * r[1] + l[9] * r[2] + l[13] * r[3];
        o[2] = l[2] * r[0] + l[6] * r[1] + l[10] * r[2] + l[14] * r[3];
        o[3] = l[3] * r[0] + l[7] * r[1] + l[11] * r[2] + l[15] * r[3];

        o[4] = l[0] * r[4] + l[4] * r[5] + l[8] * r[6] + l[12] * r[7];
        o[5] = l[1] * r[4] + l[5] * r[5] + l[9] * r[6] + l[13] * r[7];
        o[6] = l[2] * r[4] + l[6] * r[5] + l[10] * r[6] + l[14] * r[7];
        o[7] = l[3] * r[4] + l[7] * r[5] + l[11] * r[6] + l[15] * r[7];

        o[8] = l[0] * r[8] + l[4] * r[9] + l[8] * r[10] + l[12] * r[11];
        o[9] = l[1] * r[8] + l[5] * r[9] + l[9] * r[10] + l[13] * r[11];
        o[10] = l[2] * r[8] + l[6] * r[9] + l[10] * r[10] + l[12] * r[11];
        o[11] = l[3] * r[8] + l[7] * r[9] + l[11] * r[10] + l[15] * r[11];

        o[12] = l[0] * r[12] + l[4] * r[13] + l[8] * r[14] + l[12] * r[15];
        o[13] = l[1] * r[12] + l[5] * r[13] + l[9] * r[14] + l[13] * r[15];
        o[14] = l[2] * r[12] + l[6] * r[13] + l[10] * r[14] + l[14] * r[15];
        o[15] = l[3] * r[12] + l[7] * r[13] + l[11] * r[14] + l[15] * r[15];
    }

    multiply4(in4, out4) {

        if (in4 instanceof Vector4 === false || out4 instanceof Vector4 === false) {
            throw new Error("错误的参数类型, 需要Vector4");
        }

        let l = this.__data;
        let r = in4.__data;
        let o = out4.__data;

        o[0] = l[0] * r[0] + l[4] * r[1] + l[8] * r[2] + l[12] * r[3];
        o[1] = l[1] * r[0] + l[5] * r[1] + l[9] * r[2] + l[13] * r[3];
        o[2] = l[2] * r[0] + l[6] * r[1] + l[10] * r[2] + l[14] * r[3];
        o[3] = l[3] * r[0] + l[7] * r[1] + l[11] * r[2] + l[15] * r[3];
    }

    inverse(out4x4) {

        //计算伴随矩阵
        let d = this.__data;
        let o = out4x4.__data;

        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                //伴随矩阵需要转置一下，这里注意下标
                o[r * 4 + c] = Math.pow(-1, c + r) * this.determinant_order_3(c, r);
            }
        }

        //计算这个4x4矩阵的行列式
        let determinant = d[0] * o[0] + d[1] * o[4] + d[2] * o[8] + d[3] * o[12];

        if (determinant === 0) {
            //没有行列式
            throw new Error("无逆矩阵")
        }

        for (let i = 0; i < 16; i++) {
            o[i] /= determinant;
        }
    }

    transpose(out4x4) {

        let d = this.__data;
        let o = out4x4.__data;
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                o[r * 4 + c] = d[c * 4 + r];
            }
        }
    }

    transpose_self() {

        let d = this.__data;
        let temp = 0;
        for (let c = 0; c < 4; c++) {
            for (let r = c; r < 4; r++) {
                temp = d[r * 4 + c];
                d[r * 4 + c] = d[c * 4 + r];
                d[c * 4 + r] = temp;
            }
        }
    }

    inverse_transpose(out4x4) {

        this.inverse(out4x4);
        out4x4.transpose_self();
    }

    /**
     * 专门用来计算3阶行列式的
     */
    determinant_order_3(ignore_column, ignore_row) {

        let d = this.__data;
        let product_a = 1;
        let product_b = 1;
        let sum = 0;
        let cols_arr = [];
        let rows_arr = [];
        for (let i = 0; i < 4; i++) {
            if (i !== ignore_column) {
                cols_arr.push(i);
            }
            if (i !== ignore_row) {
                rows_arr.push(i);
            }
        }
        for (let col_idx = 0; col_idx < 3; col_idx++) {
            product_a = product_b = 1;
            for (let i = 0; i < 3; i++) {
                product_a *= d[cols_arr[(col_idx + i) % 3] * 4 + rows_arr[i]];
                product_b *= d[cols_arr[(col_idx + i) % 3] * 4 + rows_arr[2 - i]];
            }
            sum += product_a - product_b;
        }

        return sum;
    }

    get(c, r) {

        return this.__data[c * 4 + r];
    }

    set(c, r, v) {

        this.__data[c * 4 + r] = v;
    }

    to_identity() {

        let o = this.__data;

        o[0] = 1.0;
        o[1] = 0.0;
        o[2] = 0.0;
        o[3] = 0.0;

        o[4] = 0.0;
        o[5] = 1.0;
        o[6] = 0.0;
        o[7] = 0.0;

        o[8] = 0.0;
        o[9] = 0.0;
        o[10] = 1.0;
        o[11] = 0.0;

        o[12] = 0.0;
        o[13] = 0.0;
        o[14] = 0.0;
        o[15] = 1.0;
    }

    inverse_z() {

        this.__data[8] *= -1.0;
        this.__data[9] *= -1.0;
        this.__data[10] *= -1.0;
    }

    copy_from(in4x4) {
        RE1236_Utility.Array_Copy(in4x4.data, 0, this.data, 0, 16, true);
    }

    clear_and_init_with_orthogonal(width, height, near, far) {

        let o = this.__data;

        o[0] = 2.0 / width;
        o[1] = 0.0;
        o[2] = 0.0;
        o[3] = 0.0;

        o[4] = 0.0;
        o[5] = 2.0 / height;
        o[6] = 0.0;
        o[7] = 0.0;

        o[8] = 0.0;
        o[9] = 0.0;
        o[10] = 2.0 / Math.abs(far - near);
        o[11] = 0.0;

        o[12] = 0.0;
        o[13] = 0.0;
        o[14] = -((far + near) / (far - near));
        o[15] = 1.0;
    }

    clear_and_init_with_perspective(near, far, fovy, aspect) {

        let o = this.__data;

        let f = 1.0 / Math.tan(fovy / 2);
        let nf = 1 / (far - near);

        o[0] = f / aspect;
        o[1] = 0;
        o[2] = 0;
        o[3] = 0;

        o[4] = 0;
        o[5] = f;
        o[6] = 0;
        o[7] = 0;

        o[8] = 0;
        o[9] = 0;
        o[10] = (far + near) * nf;
        o[11] = 1;

        o[12] = 0;
        o[13] = 0;
        o[14] = -2 * far * near * nf;
        o[15] = 0;
    }
}

/**
 * 四元数
 */
class Quaternion {

    s = 0;
    x = 0;
    y = 0;
    z = 0;

    set(s, x, y, z) {

        this.s = s;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    conjugate(q_out) {

        q_out.s = this.s;
        q_out.x = -this.x;
        q_out.y = -this.y;
        q_out.z = -this.z;
    }

    /**
     *   sasb−xaxb−yayb−zazb
     * +(saxb+sbxa+yazb−ybza)i
     * +(sayb+sbya+zaxb−zbxa)j
     * +(sazb+sbza+xayb−xbya)k
     * @param q_in
     * @param q_out
     */
    multiply(q_in, q_out) {

        let a = this;
        let b = q_in;
        let o = q_out;

        o.s = a.s * b.s - a.x * b.x - a.y * b.y - a.z * b.z;
        o.x = a.s * b.x + b.s * a.x + a.y * b.z - b.y * a.z;
        o.y = a.s * b.y + b.s * a.y + a.z * b.x - b.z * a.x;
        o.z = a.s * b.z + b.s * a.z + a.x * b.y - b.x * a.y;
    }

    normalize_pure_part() {

        let mag = Math.sqrt(Math.pow(this.x, 2.0) + Math.pow(this.y, 2.0) + Math.pow(this.z, 2.0));
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
        if (Number.isNaN(this.x) || Number.isNaN(this.y) || Number.isNaN(this.z)) {
            throw new Error("非法的转子四元数: 四元数虚部为NaN, 可能是由于旋转轴的模长为0");
        }
    }

    become_point_quaternion(x, y, z) {

        this.s = 0.0;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    //cosθ=s1s2+x1x2+y1y2+z1z2 for norm q
    become_rotor_quaternion(x, y, z, radians) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.normalize_pure_part();

        this.s = Math.cos(radians / 2.0);
        this.x *= Math.sin(radians / 2.0);
        this.y *= Math.sin(radians / 2.0);
        this.z *= Math.sin(radians / 2.0);
    }

    static __Rotate_Cached = {

        rotor_q: new Quaternion(),
        point_q: new Quaternion(),
        rotor_q_conjugate: new Quaternion(),
        temp_q: new Quaternion(),
        result_q: new Quaternion(),
        result_vec: new Vector4()
    };

    static Rotate(rotor_q, point_q, out_q) {

        rotor_q.conjugate(Quaternion.__Rotate_Cached.rotor_q_conjugate);
        rotor_q.multiply(point_q, Quaternion.__Rotate_Cached.temp_q);
        if (out_q === undefined) {
            out_q = Quaternion.__Rotate_Cached.result_q;
        }
        Quaternion.__Rotate_Cached.temp_q.multiply(Quaternion.__Rotate_Cached.rotor_q_conjugate, out_q);
    }

    static Rotate_vector(rotor_vec, point_vec, radians, out_vec) {

        Quaternion.__Rotate_Cached.rotor_q.become_rotor_quaternion(rotor_vec.data[0], rotor_vec.data[1], rotor_vec.data[2], radians);
        Quaternion.__Rotate_Cached.point_q.become_point_quaternion(point_vec.data[0], point_vec.data[1], point_vec.data[2],);
        Quaternion.__Rotate_Cached.rotor_q.conjugate(Quaternion.__Rotate_Cached.rotor_q_conjugate);
        Quaternion.__Rotate_Cached.rotor_q.multiply(this.__Rotate_Cached.point_q, Quaternion.__Rotate_Cached.temp_q);
        if (out_vec === undefined) {
            out_vec = Quaternion.__Rotate_Cached.result_vec;
        }
        Quaternion.__Rotate_Cached.temp_q.multiply(Quaternion.__Rotate_Cached.rotor_q_conjugate, Quaternion.__Rotate_Cached.result_q);
        out_vec.data[0] = Quaternion.__Rotate_Cached.result_q.x;
        out_vec.data[1] = Quaternion.__Rotate_Cached.result_q.y;
        out_vec.data[2] = Quaternion.__Rotate_Cached.result_q.z;
    }

    static Get_Rotate_Result_Quaternion() {

        return this.__Rotate_Cached.result_q;
    }

    static Get_Rotate_Result_Vector4() {

        return this.__Rotate_Cached.result_vec;
    }
}

class Array_Buffer_Desc {

    __elem_type = null;
    __elem_cnt_per_stride = null;
    __whether_normalize = null;
    __stride_cnt = null;
    __offset_cnt = null;

    constructor(elem_type, elem_cnt_per_stride, whether_normalize, stride_cnt, offset_cnt) {

        this.__elem_type = elem_type;
        this.__elem_cnt_per_stride = elem_cnt_per_stride;
        this.__whether_normalize = whether_normalize;
        this.__stride_cnt = stride_cnt;
        this.__offset_cnt = offset_cnt;
    }

    can_fit_into(desc) {

        return (this.__elem_type === desc.__elem_type
            && this.__elem_cnt_per_stride <= desc.__elem_cnt_per_stride
            && this.__stride_cnt <= desc.__stride_cnt);
    }

    format_equal_with(desc) {

        return (this.__elem_type === desc.__elem_type
            && this.__elem_cnt_per_stride <= desc.__elem_cnt_per_stride
            && this.__stride_cnt === desc.__stride_cnt);
    }

    elem_cnt_per_stride_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__elem_cnt_per_stride;
    }

    stride_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__stride_cnt;
    }

    offset_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__offset_cnt;
    }

    static get ELEM_TYPE_FLOAT() {

        return 4;
    }

    static This_Type_To_WebGL_Type(gl, this_type) {

        switch (this_type) {
            case Array_Buffer_Desc.ELEM_TYPE_FLOAT:
                return gl.FLOAT;
            default:
                return null;
        }
    }

    static This_Type_To_Size_Bytes(this_type) {

        switch (this_type) {
            case Array_Buffer_Desc.ELEM_TYPE_FLOAT:
                return 4;
            default:
                return null;
        }
    }
}

class Mesh_Attr {

    constructor(mesh_attr_name) {

        if (arguments.length !== 1) {
            throw new Error("参数数量错误! 传入" + arguments.length + "个但是需要1个");
        }
        this.mesh_attr_name = mesh_attr_name;
    }

    mesh_attr_name = "";
    cpu_buffer = null;
    gpu_buffer = null;
    buffer_desc = null;
}

class Mesh {

    constructor(mesh_name) {

        if (arguments.length !== 1) {
            throw new Error("参数数量错误! 传入" + arguments.length + "个但是需要1个");
        }
        this.mesh_name = mesh_name;
    }

    mesh_name = "";
    attr_map = new Map();
    has_idx_buffer = false;
    vertex_or_idx_cnt = 0;
    cpu_idx_buffer = null;
    gpu_idx_buffer = null;
}

class Texture2D {

    __s3r_belongs_to = null;

    __webgl2_texture = null;

    constructor(s3r) {
        this.__s3r_belongs_to = s3r;
    }
}

class SL_Type {

    static get FLOAT32_CNT() {
        return 0;
    }

    get data() {
        return null;
    }

    copy_from(float32) {

    }

    static Copy_Array(from, from_start, to, to_start, length) {
        for (let i = 0; i < length; i++) {
            to[to_start + i] = from[from_start + i];
        }
    }
}

/**
 * Shading Language Type
 */
class SL_Type_Int32 {

    __data = new Int32Array(1);

    static get INT32_CNT() {
        return 1;
    }

    get data() {
        return this.__data;
    }

    copy_from(uint32, from_start) {
        SL_Type.Copy_Array(uint32, from_start, this.__data, 0, this.__data.length);
    }
}

/**
 * Shading Language Type
 */
class SL_Type_Float32 {

    __data = new Float32Array(1);

    static get FLOAT32_CNT() {
        return 1;
    }

    get data() {
        return this.__data;
    }

    copy_from(float32, from_start) {
        SL_Type.Copy_Array(float32, from_start, this.__data, 0, this.__data.length);
    }
}

/**
 * Shading Language Type
 */
class SL_Type_Vec4 {

    __data = new Float32Array(4);

    static get FLOAT32_CNT() {
        return 4;
    }

    get data() {
        return this.__data;
    }

    copy_from(float32, from_start) {
        SL_Type.Copy_Array(float32, from_start, this.__data, 0, this.__data.length);
    }
}

/**
 * Shading Language Type
 */
class SL_Type_Mat4 {

    __data = new Float32Array(16);

    static get FLOAT32_CNT() {
        return 16;
    }

    get data() {
        return this.__data;
    }

    copy_from(float32_from, from_start) {
        SL_Type.Copy_Array(float32_from, from_start, this.__data, 0, this.__data.length);
    }
}

class Program_Ctx {

    __webgl2_vs = null;
    __webgl2_fs = null;
    __webgl2_program = null;
    __per_vertex_attr_location_map = new Map();
    __uniform_location_map = new Map();
    __per_instance_attr_location_map = new Map();

    get vs() {
        return this.__webgl2_vs;
    }

    get fs() {
        return this.__webgl2_fs;
    }

    get program() {
        return this.__webgl2_program;
    }

    get per_vertex_attr_location_map() {
        return this.__per_vertex_attr_location_map;
    }

    get uniform_location_map() {
        return this.__uniform_location_map;
    }

    get per_instance_attr_location_map() {
        return this.__per_instance_attr_location_map;
    }
}

class Component {

    __go_belongs_to = null;

    constructor(go_belongs_to) {
        this.__go_belongs_to = go_belongs_to;
    }
}

class Transform extends Component {

    __mat4x4 = new Matrix4x4();
    __stacked_mat4x4 = new Matrix4x4();

    __scale = new Float32Array(3);
    __rotation = new Float32Array(3);
    __translation = new Float32Array(3);

    __need_update = true;

    static __Update_Matrix_Cached = {
        axis_vec: new Vector4(),
        point_vec: new Vector4(),
        result_vec: new Vector4()
    };

    constructor(go_belongs_to) {

        super(go_belongs_to);

        this.__scale[0] = 1.0;
        this.__scale[1] = 1.0;
        this.__scale[2] = 1.0;

        this.__rotation[0] = 0.0;
        this.__rotation[1] = 0.0;
        this.__rotation[2] = 0.0;

        this.__translation[0] = 0.0;
        this.__translation[1] = 0.0;
        this.__translation[2] = 0.0;
    }

    set_scale(x, y, z) {

        this.__scale[0] = x;
        this.__scale[1] = y;
        this.__scale[2] = z;
        this.__need_update = true;
    }

    set_rotation(x, y, z) {

        this.__rotation[0] = x;
        this.__rotation[1] = y;
        this.__rotation[2] = z;
        this.__need_update = true;
    }

    set_translation(x, y, z) {

        this.__translation[0] = x;
        this.__translation[1] = y;
        this.__translation[2] = z;
        this.__need_update = true;
    }

    need_update() {

        return this.__need_update;
    }

    update_transform_matrix() {

        this.update_transform_to(this.__mat4x4);
    }

    update_transform_to(in4x4) {

        if (this.__need_update === false) {
            return;
        }
        this.__need_update = false;

        //先缩放，再旋转
        in4x4.to_identity();
        in4x4.data[0] = this.__scale[0];
        in4x4.data[5] = this.__scale[1];
        in4x4.data[10] = this.__scale[2];

        //绕y旋转xz
        Transform.__Update_Matrix_Cached.axis_vec.data[0] = in4x4.data[4];
        Transform.__Update_Matrix_Cached.axis_vec.data[1] = in4x4.data[5];
        Transform.__Update_Matrix_Cached.axis_vec.data[2] = in4x4.data[6];

        Transform.__Update_Matrix_Cached.point_vec.data[0] = in4x4.data[0];
        Transform.__Update_Matrix_Cached.point_vec.data[1] = in4x4.data[1];
        Transform.__Update_Matrix_Cached.point_vec.data[2] = in4x4.data[2];
        Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation[1], Transform.__Update_Matrix_Cached.result_vec);
        in4x4.data[0] = Transform.__Update_Matrix_Cached.result_vec.data[0];
        in4x4.data[1] = Transform.__Update_Matrix_Cached.result_vec.data[1];
        in4x4.data[2] = Transform.__Update_Matrix_Cached.result_vec.data[2];

        Transform.__Update_Matrix_Cached.point_vec.data[0] = in4x4.data[8];
        Transform.__Update_Matrix_Cached.point_vec.data[1] = in4x4.data[9];
        Transform.__Update_Matrix_Cached.point_vec.data[2] = in4x4.data[10];
        Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation[1], Transform.__Update_Matrix_Cached.result_vec);
        in4x4.data[8] = Transform.__Update_Matrix_Cached.result_vec.data[0];
        in4x4.data[9] = Transform.__Update_Matrix_Cached.result_vec.data[1];
        in4x4.data[10] = Transform.__Update_Matrix_Cached.result_vec.data[2];

        //绕x旋转yz
        Transform.__Update_Matrix_Cached.axis_vec.data[0] = in4x4.data[0];
        Transform.__Update_Matrix_Cached.axis_vec.data[1] = in4x4.data[1];
        Transform.__Update_Matrix_Cached.axis_vec.data[2] = in4x4.data[2];

        Transform.__Update_Matrix_Cached.point_vec.data[0] = in4x4.data[4];
        Transform.__Update_Matrix_Cached.point_vec.data[1] = in4x4.data[5];
        Transform.__Update_Matrix_Cached.point_vec.data[2] = in4x4.data[6];
        Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation[0], Transform.__Update_Matrix_Cached.result_vec);
        in4x4.data[4] = Transform.__Update_Matrix_Cached.result_vec.data[0];
        in4x4.data[5] = Transform.__Update_Matrix_Cached.result_vec.data[1];
        in4x4.data[6] = Transform.__Update_Matrix_Cached.result_vec.data[2];

        Transform.__Update_Matrix_Cached.point_vec.data[0] = in4x4.data[8];
        Transform.__Update_Matrix_Cached.point_vec.data[1] = in4x4.data[9];
        Transform.__Update_Matrix_Cached.point_vec.data[2] = in4x4.data[10];
        Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation[0], Transform.__Update_Matrix_Cached.result_vec);
        in4x4.data[8] = Transform.__Update_Matrix_Cached.result_vec.data[0];
        in4x4.data[9] = Transform.__Update_Matrix_Cached.result_vec.data[1];
        in4x4.data[10] = Transform.__Update_Matrix_Cached.result_vec.data[2];

        //绕z旋转xy
        Transform.__Update_Matrix_Cached.axis_vec.data[0] = in4x4.data[8];
        Transform.__Update_Matrix_Cached.axis_vec.data[1] = in4x4.data[9];
        Transform.__Update_Matrix_Cached.axis_vec.data[2] = in4x4.data[10];

        Transform.__Update_Matrix_Cached.point_vec.data[0] = in4x4.data[0];
        Transform.__Update_Matrix_Cached.point_vec.data[1] = in4x4.data[1];
        Transform.__Update_Matrix_Cached.point_vec.data[2] = in4x4.data[2];
        Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation[2], Transform.__Update_Matrix_Cached.result_vec);
        in4x4.data[0] = Transform.__Update_Matrix_Cached.result_vec.data[0];
        in4x4.data[1] = Transform.__Update_Matrix_Cached.result_vec.data[1];
        in4x4.data[2] = Transform.__Update_Matrix_Cached.result_vec.data[2];

        Transform.__Update_Matrix_Cached.point_vec.data[0] = in4x4.data[4];
        Transform.__Update_Matrix_Cached.point_vec.data[1] = in4x4.data[5];
        Transform.__Update_Matrix_Cached.point_vec.data[2] = in4x4.data[6];
        Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation[2], Transform.__Update_Matrix_Cached.result_vec);
        in4x4.data[4] = Transform.__Update_Matrix_Cached.result_vec.data[0];
        in4x4.data[5] = Transform.__Update_Matrix_Cached.result_vec.data[1];
        in4x4.data[6] = Transform.__Update_Matrix_Cached.result_vec.data[2];

        //再平移
        in4x4.data[12] = this.__translation[0];
        in4x4.data[13] = this.__translation[1];
        in4x4.data[14] = this.__translation[2];
    }
}

class Material extends Component {

    //使用的着色器
    __program_ctx_used = null;
    //使用的网格
    __mesh_used = null;
    //使用的纹理
    __texture_used_map = new Map();
    //使用的uniform
    __uniform_data_map = new Map();

    __pipeline_settings = {
        culling: {
            is_enabled: true,
            front_face: WebGL2RenderingContext.CW,
            cull_face: WebGL2RenderingContext.BACK
        }
    }

    constructor(go_belongs_to) {

        super(go_belongs_to);
    }

    use_program(prog_name) {

        //TODO: 找不到报错
        this.__program_ctx_used = this.__go_belongs_to.__s3r_belongs_to.__program_ctx_map.get(prog_name);
    }

    use_mesh(mesh_name) {

        this.__mesh_used = this.__go_belongs_to.__s3r_belongs_to.get_mesh(mesh_name);
        if (this.__mesh_used === null) {
            throw new Error("mesh不存在");
        }
    }

    /**
     *
     * @param name
     * @param type SL_Type_Vec4 SL_Type_Mat4
     */
    add_uniform(name, type) {

        this.__uniform_data_map.set(name, new type());
    }

    /**
     *
     * @param name
     * @param float32_arr
     * @param from_idx
     */
    set_uniform(name, float32_arr, from_idx) {

        this.__uniform_data_map.get(name).copy_from(float32_arr, from_idx);
    }

    add_texture2d(name, slot) {

        let tex2d = this.__go_belongs_to.__s3r_belongs_to.get_texture2d(name);
        if (tex2d === null) {
            throw new Error("无法添加TEXTURE2D: " + name + ", 找不到");
        }
        this.texture_used_map.set(name, [tex2d, slot]);
    }

    get program_ctx_used() {
        return this.__program_ctx_used;
    }

    get mesh_used() {
        return this.__mesh_used;
    }

    get texture_used_map() {
        return this.__texture_used_map;
    }

    get uniform_data_map() {
        return this.__uniform_data_map;
    }
}

class Graphics_Object {

    id_str = "game object";

    __tree_uid0 = null;

    __s3r_belongs_to = null;

    __parent_go = null;
    __child_go_arr = [];

    __component_map = new Map();

    constructor(s3r_belongs_to, parent_graphics_object) {

        if (arguments.length !== 2) {
            throw new Error("参数数量错误，需要2个")
        }

        this.__s3r_belongs_to = s3r_belongs_to;
        this.__parent_go = parent_graphics_object;

        this.__component_map.set(Transform, new Transform(this));
        this.__component_map.set(Material, new Material(this));
    }

    /**
     *
     * @param type
     * @return {*}
     */
    get_component(type) {

        return this.__component_map.get(type);
    }

    /**
     *
     * @param go
     * @return 未找到返回-1，否则返回有效的idx
     */
    find_child_idx(go) {

        return this.__child_go_arr.findIndex((elem) => {
            return Object.is(elem, go);
        });
    }

    become_child_of(parent_go) {

        parent_go.add_child(this);
    }

    remove_from_parent() {

        if (this.__parent_go === null) {
            return;
        }
        this.__parent_go.remove_child(this);
    }

    add_child(child_go) {

        //如果自己的tree凭证没有初始化，则初始化
        if (this.__tree_uid0 === null) {
            this.__tree_uid0 = {uid1: {}};
        }

        //不能加入和自己属于同一棵树的
        if (child_go.__tree_uid0 === null || child_go.__tree_uid0.uid1 !== this.__tree_uid0.uid1) {
            //一定不是一个树内，添加
            this.__child_go_arr.push(child_go);
            child_go.__parent_go = this;
            //传染uid
            if (child_go.__tree_uid0 === null) {
                child_go.__tree_uid0 = this.__tree_uid0;
            } else {
                child_go.__tree_uid0.uid1 = this.__tree_uid0.uid1;
            }
        } else {
            //是一个树内的
            console.warn("Graphics_Object.add_child(...)重复添加已经在此树内的go节点");
        }
    }

    /**
     * 移除child_go以及他下面的（可能的）整棵树
     * @param child_go
     */
    remove_child(child_go) {

        //如果移除的go本来就不在，直接返回
        if (child_go.__tree_uid0.uid1 !== this.__tree_uid0.uid1) {
            console.warn("buzai ")
            return;
        }

        let idx = this.find_child_idx(child_go);
        if (idx < 0) {
            //没有此child就返回
            return;
        }
        //删除
        this.__child_go_arr.splice(idx, 1);
        // * 忘掉你和我曾经在这棵树下存在过的点点滴滴(T⌓T)
        child_go.__tree_uid0 = null;
    }
}

class Webgl2_Renderer {

    __cvs = null;
    __gl = null;

    __default_program_ctx = null;
    __program_ctx_map = new Map();

    __static = {
        mesh_map: new Map(),
        text_mesh_map: new Map(),
        texture2d_map: new Map()
    };

    __config = {
        clear_flag: 0,
        clear_color: null,
        clear_depth: 0
    };

    static Constants = {

        get CLEAR_COLOR_BUFFER() {
            return WebGL2RenderingContext.COLOR_BUFFER_BIT;
        },
        get CLEAR_DEPTH_BUFFER() {
            return WebGL2RenderingContext.DEPTH_BUFFER_BIT;
        },
        get VERTEX_SHADER() {
            return WebGL2RenderingContext.VERTEX_SHADER;
        },
        get FRAGMENT_SHADER() {
            return WebGL2RenderingContext.FRAGMENT_SHADER;
        },
        get RGB() {
            return WebGL2RenderingContext.RGB;
        },
        get RGBA() {
            return WebGL2RenderingContext.RGBA;
        },
        get UNSIGNED_BYTE() {
            return WebGL2RenderingContext.UNSIGNED_BYTE;
        }
    };

    //TODO: 增加glsl语法，预处理所有webgl location
    //TODO: /^((?:\s|\n)*@([\w]+)<%(?:\s|\n)*(\n|.)*?(?:\s|\n)*%>(?:\s|\n)*)$/g;
    create_program_ctx(ctx_name, vs_code, fs_code, attr_desc) {

        let ctx = new Program_Ctx();
        ctx.__webgl2_vs = this.create_webgl2_shader(vs_code, Webgl2_Renderer.Constants.VERTEX_SHADER);
        ctx.__webgl2_fs = this.create_webgl2_shader(fs_code, Webgl2_Renderer.Constants.FRAGMENT_SHADER);
        ctx.__webgl2_program = this.create_webgl2_program(ctx.__webgl2_vs, ctx.__webgl2_fs);

        for (let attr of attr_desc.per_vertex) {
            ctx.__per_vertex_attr_location_map.set(
                attr,
                this.__gl.getAttribLocation(ctx.__webgl2_program, attr.name)
            );
            if (typeof attr.alias !== "string") {
                attr.alias = attr.name;
            }
        }

        for (let attr of attr_desc.uniform) {
            ctx.__uniform_location_map.set(
                attr,
                this.__gl.getUniformLocation(ctx.__webgl2_program, attr.name)
            );
            if (typeof attr.alias !== "string") {
                attr.alias = attr.name;
            }
        }

        this.__program_ctx_map.set(ctx_name, ctx);

        return ctx;
    }

    init(cvs) {


        this.__cvs = cvs;
        this.__gl = cvs.getContext(
            "webgl2",
            {
                alpha: false,
                preserveDrawingBuffer: true
            }
        );

        if (this.__gl === null) {
            throw new Error("无法获取webgl2上下文");
        }

        //config
        this.__config.clear_flag = Webgl2_Renderer.Constants.CLEAR_COLOR_BUFFER | Webgl2_Renderer.Constants.CLEAR_DEPTH_BUFFER;
        this.__config.clear_color = [0.0, 0.0, 0.0, 0.0];
        this.__config.clear_depth = 1.0;

        let vs = `
              precision mediump float;
              uniform mat4 au_mat4_m; // 到世界坐标系
              uniform mat4 au_mat4_vp;// 到相机坐标系再到裁剪空间(GPU会自动做透视除法转换到NDC坐标系)
              uniform vec4 au_vec4_color;
              
              attribute vec4 a_vec4_pos;

              varying vec4 v_vec4_color;

              void main() {
              
                gl_Position = au_mat4_vp * au_mat4_m * a_vec4_pos;
                v_vec4_color = au_vec4_color;
              }
        `;

        let fs = `
              precision mediump float;

              varying vec4 v_vec4_color;

              void main() {
              
                gl_FragColor = v_vec4_color;
              }
        `;

        this.__default_program_ctx = this.create_program_ctx(
            "s3r_default",
            vs,
            fs,
            {
                per_vertex: [
                    {
                        name: "a_vec4_pos",
                        alias: null,
                        desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0)
                    }
                ],
                uniform: [
                    {name: "au_mat4_m", alias: null, type: SL_Type_Mat4},
                    {name: "au_mat4_vp", alias: null, type: SL_Type_Mat4},
                    {name: "au_vec4_color", alias: null, type: SL_Type_Vec4}
                ],
                per_instance: []
            }
        );
    }

    is_mesh_exist(mesh_name) {

        return (this.__static.mesh_map.has(mesh_name));
    }

    is_mesh_attribute_exist(mesh_name, mesh_attribute_name) {

        if (this.is_mesh_exist(mesh_name)) {
            return (this.__static.mesh_map.get(mesh_name).attr_map.has(mesh_attribute_name));
        } else {
            return false;
        }
    }

    create_mesh(mesh_name, vertex_or_idx_cnt, has_idx, idx_arr) {

        let new_mesh = new Mesh(mesh_name);
        this.__static.mesh_map.set(mesh_name, new_mesh);
        new_mesh.has_idx_buffer = has_idx;
        new_mesh.vertex_or_idx_cnt = vertex_or_idx_cnt;
        if (has_idx) {
            //应该上传索引缓冲
            let cpu_idx_buffer = new Uint16Array(idx_arr.length);
            for (let i = 0; i < idx_arr.length; i++) {
                cpu_idx_buffer[i] = idx_arr[i];
            }
            new_mesh.cpu_idx_buffer = cpu_idx_buffer;
        }
    }

    update_mesh_attribute(mesh_name, mesh_attr_name, arr, elem_type, elem_cnt_per_stride, whether_normalize, stride_cnt, offset_cnt) {

        if (this.is_mesh_attribute_exist(mesh_name, mesh_attr_name)) {
            throw new Error("mesh attr 已存在");
        }
        if (this.is_mesh_exist(mesh_name) === false) {
            throw new Error("mesh name 不存在");
        }
        let mesh = this.__static.mesh_map.get(mesh_name);
        let mesh_attr = new Mesh_Attr(mesh_attr_name);
        mesh.attr_map.set(mesh_attr_name, mesh_attr);
        // need 大改
        //上传cpu缓冲
        let cpu_buffer = new Float32Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            cpu_buffer[i] = arr[i];
        }
        mesh_attr.cpu_buffer = cpu_buffer;
        mesh_attr.buffer_desc = new Array_Buffer_Desc(elem_type, elem_cnt_per_stride, whether_normalize, stride_cnt, offset_cnt);
    }

    update_mesh_to_gpu(mesh_name) {

        //获取cpu buffer
        if (this.is_mesh_exist(mesh_name) === false) {
            throw new Error("mesh name 不存在");
        }
        let mesh = this.__static.mesh_map.get(mesh_name);
        if (mesh.has_idx_buffer) {
            let original_gpu_idx_buffer = mesh.gpu_idx_buffer;
            let new_gpu_buffer = this.__gl.createBuffer();
            if (new_gpu_buffer === null || new_gpu_buffer === undefined) {
                throw new Error("无法创建 gpu array buffer");
            }
            this.__gl.bindBuffer(this.__gl.ELEMENT_ARRAY_BUFFER, new_gpu_buffer);
            this.__gl.bufferData(this.__gl.ELEMENT_ARRAY_BUFFER, mesh.cpu_idx_buffer, this.__gl.STATIC_DRAW);
            mesh.gpu_idx_buffer = new_gpu_buffer;
            if (original_gpu_idx_buffer !== null) {
                this.__gl.deleteBuffer(original_gpu_idx_buffer);
            }
        }
        for (let mesh_attr_kv of mesh.attr_map) {
            let original_gpu_buffer = mesh_attr_kv[1].gpu_buffer;
            let new_gpu_buffer = this.__gl.createBuffer();
            if (new_gpu_buffer === null || new_gpu_buffer === undefined) {
                throw new Error("无法创建 gpu array buffer");
            }
            this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, new_gpu_buffer);
            this.__gl.bufferData(this.__gl.ARRAY_BUFFER, mesh_attr_kv[1].cpu_buffer, this.__gl.STATIC_DRAW);
            mesh_attr_kv[1].gpu_buffer = new_gpu_buffer;
            if (original_gpu_buffer !== null) {
                this.__gl.deleteBuffer(original_gpu_buffer);
            }
        }
    }

    create_texture(name) {

        let tex2d = new Texture2D(this);
        this.__static.texture2d_map.set(name, tex2d);
        tex2d.__webgl2_texture = this.__gl.createTexture();

        this.__gl.activeTexture(this.__gl.TEXTURE0);
        this.__gl.bindTexture(this.__gl.TEXTURE_2D, tex2d.__webgl2_texture);

        this.__gl.texParameteri(this.__gl.TEXTURE_2D, this.__gl.TEXTURE_WRAP_S, this.__gl.CLAMP_TO_EDGE);
        this.__gl.texParameteri(this.__gl.TEXTURE_2D, this.__gl.TEXTURE_WRAP_T, this.__gl.CLAMP_TO_EDGE);
        this.__gl.texParameteri(this.__gl.TEXTURE_2D, this.__gl.TEXTURE_MIN_FILTER, this.__gl.NEAREST);
        this.__gl.texParameteri(this.__gl.TEXTURE_2D, this.__gl.TEXTURE_MAG_FILTER, this.__gl.NEAREST);
    }

    upload_texture2d_data(name, format_desired, actual_format, actual_format_elem_type, data, width, height) {

        if (this.__static.texture2d_map.has(name) === false) {
            throw new Error("2D纹理名称不存在");
        }

        let tex2d = this.__static.texture2d_map.get(name);

        this.__gl.activeTexture(this.__gl.TEXTURE0);
        this.__gl.bindTexture(this.__gl.TEXTURE_2D, tex2d.__webgl2_texture);

        //是否有width height
        if (typeof width === "undefined" || typeof height === "undefined") {
            this.__gl.texImage2D(this.__gl.TEXTURE_2D, 0, format_desired, actual_format, actual_format_elem_type, data);
        } else {
            this.__gl.texImage2D(this.__gl.TEXTURE_2D, 0, format_desired, width, height, 0, actual_format, actual_format_elem_type, data);
        }
    }

    bind_texture2d_to_slot(texture2d_or_name, idx) {

        if (typeof texture2d_or_name === "string") {
            if (this.__static.texture2d_map.has(texture2d_or_name) === false) {
                throw new Error("2D纹理名称不存在");
            }
            texture2d_or_name = this.__static.texture2d_map.get(texture2d_or_name);
        } else if (texture2d_or_name instanceof Texture2D === false) {
            throw new Error("传入的参数类型错误");
        }

        if (idx < 0 || idx >= this.max_texture2d_position_cnt()) {
            throw new Error("position idx越界, 请使用S3R.get_max_texture2d_position_cnt()确定范围");
        }

        this.__gl.activeTexture(this.__gl["TEXTURE" + idx]);
        this.__gl.bindTexture(this.__gl.TEXTURE_2D, texture2d_or_name.__webgl2_texture);
    }

    get_texture2d(name) {

        if (this.__static.texture2d_map.has(name)) {
            return this.__static.texture2d_map.get(name);
        } else {
            return null;
        }
    }

    /**
     * 0 ~ (返回值 - 1)
     * @return {any}
     */
    max_texture2d_position_cnt() {

        return this.__gl.getParameter(WebGL2RenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    }

    setup_render_state(go) {

        let material = go.get_component(Material);
        let pipeline = material.__pipeline_settings;

        this.__gl.useProgram(material.__program_ctx_used.__webgl2_program);

        if (pipeline.culling.is_enabled) {
            this.__gl.enable(WebGL2RenderingContext.CULL_FACE);
            this.__gl.frontFace(pipeline.culling.front_face);
            this.__gl.cullFace(pipeline.culling.cull_face);
        } else {
            this.__gl.enable();
        }

        this.__gl.enable(WebGL2RenderingContext.DEPTH_TEST);
        this.__gl.depthFunc(WebGL2RenderingContext.LESS);

        this.__gl.viewport(0, 0, this.__cvs.width, this.__cvs.height);

        this.setup_shader_data(go);
    }

    setup_shader_data(go) {

        if (go.__s3r_belongs_to !== this) {
            throw new Error("此GO(" + go.id_str + ")不属于此S3R");
        }

        let material = go.get_component(Material);
        //set index buffer
        if (material.__mesh_used.has_idx_buffer) {
            this.bind_global_idx_buffer(material.__mesh_used.gpu_idx_buffer);
        }
        //设置每顶点
        for (let kv of material.__program_ctx_used.__per_vertex_attr_location_map) {
            if (material.__mesh_used.attr_map.has(kv[0].alias)) {
                let mesh_attr = material.__mesh_used.attr_map.get(kv[0].alias);
                if (mesh_attr.buffer_desc.can_fit_into(kv[0].desc) === false) {
                    throw Error("每顶点属性" + kv[0].name + "格式不兼容");
                }
                this.setup_per_vertex_data(kv[1], mesh_attr);
            }
        }
        //设置uniform
        for (let kv of material.__program_ctx_used.__uniform_location_map) {
            if (material.__uniform_data_map.has(kv[0].alias)) {
                let uniform_data = material.__uniform_data_map.get(kv[0].alias);
                if ((uniform_data instanceof kv[0].type) === false) {
                    throw Error("Uniform属性" + kv[0] + "格式不兼容");
                }
                this.upload_uniform_with_sl_type_instance(kv[1], uniform_data);
            }
        }
        //绑定texture2d
        for (let kv of material.__texture_used_map) {
            this.bind_texture2d_to_slot(kv[1][0], kv[1][1]);
        }
    }

    set_clear_flag(clear_flag) {

        this.__config.clear_flag = clear_flag;
    }

    set_clear_color(r, g, b, a) {

        this.__config.clear_color[0] = r;
        this.__config.clear_color[1] = g;
        this.__config.clear_color[2] = b;
        this.__config.clear_color[3] = a;
    }

    set_clear_depth(depth_val) {

        this.__config.clear_depth = depth_val;
    }

    clear_frame_buffer() {

        this.__gl.clearColor(
            this.__config.clear_color[0],
            this.__config.clear_color[1],
            this.__config.clear_color[2],
            this.__config.clear_color[3]
        );
        this.__gl.clearDepth(this.__config.clear_depth);
        this.__gl.clear(this.__config.clear_flag);
    }

    draw(go) {

        if (go.get_component(Material).__mesh_used.has_idx_buffer) {
            this.__gl.drawElements(
                this.__gl.TRIANGLES,
                go.get_component(Material).__mesh_used.vertex_or_idx_cnt,
                this.__gl.UNSIGNED_SHORT,
                0
            );
        } else {
            this.__gl.drawArrays(
                this.__gl.TRIANGLES,
                0,
                go.get_component(Material).__mesh_used.vertex_or_idx_cnt,
            );
        }
    }

    end_render() {


    }

    setup_per_vertex_data(location, mesh_attr) {

        //设置slot准备渲染
        this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, mesh_attr.gpu_buffer);
        let cnt = 0;
        let base_location = location;
        let one_elem_bytes = Array_Buffer_Desc.This_Type_To_Size_Bytes(mesh_attr.buffer_desc.__elem_type);
        let cur_elem_cnt_per_stride = 0;
        let cur_stride_cnt_in_bytes = 0;
        let base_offset_cnt_in_bytes = 0;
        let cur_offset_cnt_in_bytes = 0;
        if (mesh_attr.buffer_desc.__elem_cnt_per_stride === 16) {
            //需要分成多个4
            cnt = 4;
            cur_elem_cnt_per_stride = 4;
            cur_stride_cnt_in_bytes = 4 * one_elem_bytes;
            base_offset_cnt_in_bytes = mesh_attr.buffer_desc.__offset_cnt * one_elem_bytes;
            cur_offset_cnt_in_bytes = 4 * one_elem_bytes;
        } else if (mesh_attr.buffer_desc.__elem_cnt_per_stride <= 4) {
            cnt = 1;
            cur_elem_cnt_per_stride = mesh_attr.buffer_desc.__elem_cnt_per_stride;
            cur_stride_cnt_in_bytes = mesh_attr.buffer_desc.__stride_cnt * one_elem_bytes;
            base_offset_cnt_in_bytes = mesh_attr.buffer_desc.__offset_cnt * one_elem_bytes;
            cur_offset_cnt_in_bytes = cur_stride_cnt_in_bytes;
        }
        for (let i = 0; i < cnt; i++) {
            let loc_real = base_location + i;
            this.__gl.vertexAttribPointer(
                loc_real,
                cur_elem_cnt_per_stride,
                Array_Buffer_Desc.This_Type_To_WebGL_Type(this.__gl, mesh_attr.buffer_desc.__elem_type),
                false,
                cur_stride_cnt_in_bytes,
                base_offset_cnt_in_bytes + i * cur_offset_cnt_in_bytes,
            );
            this.__gl.enableVertexAttribArray(loc_real);
        }
    }

    upload_uniform_with_sl_type_instance(location, sl_type_instance) {

        if (sl_type_instance instanceof SL_Type_Float32) {
            this.__gl.uniform1fv(location, sl_type_instance.data);
        } else if (sl_type_instance instanceof SL_Type_Int32) {
            this.__gl.uniform1iv(location, sl_type_instance.data);
        } else if (sl_type_instance instanceof SL_Type_Vec4) {
            this.__gl.uniform4fv(location, sl_type_instance.data);
        } else if (sl_type_instance instanceof SL_Type_Mat4) {
            this.__gl.uniformMatrix4fv(location, false, sl_type_instance.data);
        }
    }

    upload_uniform_with_arr(location, sl_type, float32_arr, from) {

        if (Object.is(sl_type, SL_Type_Float32)) {
            this.__gl.uniform1fv(location, float32_arr, from, sl_type.FLOAT32_CNT);
        } else if (Object.is(sl_type, SL_Type_Int32)) {
            this.__gl.uniform1iv(location, float32_arr, from, sl_type.INT32_CNT);
        } else if (Object.is(sl_type, SL_Type_Vec4)) {
            this.__gl.uniform4fv(location, float32_arr, from, sl_type.FLOAT32_CNT);
        } else if (Object.is(sl_type, SL_Type_Mat4)) {
            this.__gl.uniformMatrix4fv(location, false, float32_arr, from, sl_type.FLOAT32_CNT);
        }
    }

    bind_global_idx_buffer(gpu_idx_buffer) {

        this.__gl.bindBuffer(this.__gl.ELEMENT_ARRAY_BUFFER, gpu_idx_buffer);
    }

    /**
     * webgl program
     * @param program
     */
    setup_program(program) {

        this.__gl.useProgram(program);
    }

    create_webgl2_shader(shader_code, shader_type) {

        let shader = this.__gl.createShader(shader_type);
        this.__gl.shaderSource(shader, shader_code);
        this.__gl.compileShader(shader);
        if (this.__gl.getShaderParameter(shader, this.__gl.COMPILE_STATUS)) {
            //succeeded
            return shader;
        } else {
            //failed
            console.log(this.__gl.getShaderInfoLog(shader));
            this.__gl.deleteShader(shader);
            return null;
        }
    }

    create_webgl2_program(vs, fs) {

        let program = this.__gl.createProgram();
        this.__gl.attachShader(program, vs);
        this.__gl.attachShader(program, fs);
        this.__gl.linkProgram(program);
        if (this.__gl.getProgramParameter(program, this.__gl.LINK_STATUS)) {
            //success
            return program;
        } else {
            console.log(this.__gl.getProgramInfoLog(program));
            this.__gl.deleteProgram(program);
            return null;
        }
    }

    __resize_gpu_buffer(gpu_buffer, new_size_bytes, usage) {

        this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, gpu_buffer);
        this.__gl.bufferData(this.__gl.ARRAY_BUFFER, new_size_bytes, usage);
    }

    get_mesh(mesh_name) {

        let mesh = this.__static.mesh_map.get(mesh_name);
        if (mesh === null || mesh === undefined) {
            return null;
        }
        return mesh;
    }
}

class OBJ_Parser {

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
class Webgl2_Renderer_Extend extends Webgl2_Renderer {

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
            this.__camera.transform.__mat4x4.inverse(this.__camera.camera_inv);
            this.__camera.projection_matrix.multiply4x4(this.__camera.camera_inv, this.__camera.mat_vp);
            RE1236_Utility.Array_Copy(this.__camera.transform.__translation, 0, this.__camera.transform_pos_data, 0, Infinity, true);
        }
    }

    prepare_p_light_uniform() {

        if (this.__p_light.transform.need_update()) {
            RE1236_Utility.Array_Copy(this.__p_light.transform.__translation, 0, this.__p_light.transform_pos_data, 0, Infinity, true);
        }
        this.__p_light.length_data[0] = this.__p_light.length;
    }

    __auto_upload_tmp = {
        mat4x4: new Matrix4x4()
    }

    __auto_upload_go_uniform(go) {

        //获取go的uniform location
        //有的话就设置
        for (let kv of go.get_component(Material).program_ctx_used.__uniform_location_map) {
            if (kv[0].alias === "re_u_mat4_m" && Object.is(kv[0].type, SL_Type_Mat4)) {
                let t = go.get_component(Transform);
                super.upload_uniform_with_arr(kv[1], SL_Type_Mat4, t.__stacked_mat4x4.data, 0);
            } else if (kv[0].alias === "re_u_mat4_m_inv" && Object.is(kv[0].type, SL_Type_Mat4)) {
                let t = go.get_component(Transform);
                t.__stacked_mat4x4.inverse(this.__auto_upload_tmp.mat4x4);
                super.upload_uniform_with_arr(kv[1], SL_Type_Mat4, this.__auto_upload_tmp.mat4x4.data, 0);
            } else if (kv[0].alias === "s3re_u_mat4_vp" && Object.is(kv[0].type, SL_Type_Mat4)) {
                this.prepare_camera_uniform();
                super.upload_uniform_with_arr(kv[1], SL_Type_Mat4, this.__camera.mat_vp.data, 0);
            } else if (kv[0].alias === "s3re_u_vec4_camera_pos_world" && Object.is(kv[0].type, SL_Type_Vec4)) {
                this.prepare_camera_uniform();
                super.upload_uniform_with_arr(kv[1], SL_Type_Vec4, this.__camera.transform_pos_data, 0);
            } else if (kv[0].alias === "s3re_u_vec4_p_light_pos_world" && Object.is(kv[0].type, SL_Type_Vec4)) {
                this.prepare_p_light_uniform();
                super.upload_uniform_with_arr(kv[1], SL_Type_Vec4, this.__p_light.transform_pos_data, 0);
            } else if (kv[0].alias === "s3re_u_float_p_light_length" && Object.is(kv[0].type, SL_Type_Float32)) {
                this.prepare_p_light_uniform();
                super.upload_uniform_with_arr(kv[1], SL_Type_Float32, this.__p_light.length_data, 0);
            }
        }
    }

    setup_render_state(go) {

        super.setup_render_state(go);
        this.__auto_upload_go_uniform(go);
    }

    render(go) {

        let t = go.get_component(Transform);
        t.update_transform_to(t.__stacked_mat4x4);
        this.setup_render_state(go);
        super.draw(go);
    }

    recursive_render(go) {

        //计算stacked mat
        let t = go.get_component(Transform);
        t.update_transform_to(t.__stacked_mat4x4);
        if (go.__parent_go !== null) {
            go.__parent_go.get_component(Transform).__stacked_mat4x4.multiply4x4(t.__stacked_mat4x4, t.__stacked_mat4x4);
        }
        this.render(go);
        go.__child_go_arr.forEach((child) => {
            this.recursive_render(child);
        })
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
              
              #define MAGIC_NUMBER 1.236

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
                float brightness_factor = dot(normal_object, normalize(light_direction));
                brightness *= clamp(brightness_factor + 0.382, 0.0, 1.0);
                //brightness = pow(brightness, MAGIC_NUMBER);
                float specular = clamp(dot(normal_object, half_vector), 0.0, 1.0);
                specular = pow(specular, 128.0);
                specular *= brightness;
                //加入亮度
                vec2 y_inv_uv = f_vec2_uv;
                y_inv_uv.y = 1.0 - y_inv_uv.y;
                vec4 color = mix(vec4(0.0, 0.0, 0.0, 1.0), texture(u_s2d_tex, y_inv_uv) * 0.5 + texture(u_s2d_vid, y_inv_uv) * 0.5, brightness);
                //加入高光
                color = mix(color, vec4(1.0, 1.0, 1.0, 1.0), specular);
                s3re_FragColor = color;
              }
        `;

        this.create_program_ctx("s3re_spot_light", vs, fs, {
            per_vertex: [
                {
                    name: "v_vec4_pos",
                    alias: null,
                    desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0),
                },
                {
                    name: "v_vec4_normal",
                    alias: null,
                    desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0),
                },
                {
                    name: "v_vec2_uv",
                    alias: null,
                    desc: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 2, false, 2, 0)
                }
            ],
            uniform: [
                {
                    name: "u_mat4_m",
                    alias: "re_u_mat4_m",
                    type: SL_Type_Mat4
                },
                {
                    name: "u_mat4_m_inv",
                    alias: "re_u_mat4_m_inv",
                    type: SL_Type_Mat4
                },
                {
                    name: "u_vec4_color",
                    alias: null,
                    type: SL_Type_Vec4
                },
                {
                    name: "u_s2d_tex",
                    alias: null,
                    type: SL_Type_Int32
                },
                {
                    name: "u_s2d_vid",
                    alias: null,
                    type: SL_Type_Int32
                },
                {
                    name: "s3re_u_mat4_vp",
                    alias: null,
                    type: SL_Type_Mat4
                },
                {
                    name: "s3re_u_vec4_camera_pos_world",
                    alias: null,
                    type: SL_Type_Vec4
                },
                {
                    name: "s3re_u_vec4_p_light_pos_world",
                    alias: null,
                    type: SL_Type_Vec4
                },
                {
                    name: "s3re_u_float_p_light_length",
                    alias: null,
                    type: SL_Type_Float32
                }
            ],
            cross_go_uniform: {}
        });
    }
}

export {
    SL_Type_Mat4,
    SL_Type_Vec4,
    SL_Type,
    RE1236_Utility,
    Material,
    Mesh,
    Mesh_Attr,
    Transform,
    Component,
    Vector4,
    SL_Type_Int32,
    Array_Buffer_Desc,
    Matrix4x4,
    SL_Type_Float32,
    Texture2D,
    OBJ_Parser,
    Program_Ctx,
    Quaternion,
    Webgl2_Renderer,
    Webgl2_Renderer_Extend,
    Polygon_Triangulation,
    Graphics_Object
};



